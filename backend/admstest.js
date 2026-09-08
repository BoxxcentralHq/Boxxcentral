const http = require("http");
const { URL } = require("url");

const HOST = "0.0.0.0";
const PORT = 8088;

// --------------------------------------------------
// PER-DEVICE STATE
// Tracks whether we've already seen a registry POST
// for a given serial number, so we don't keep telling
// the device to re-register on every handshake.
// --------------------------------------------------
const devices = new Map(); // SN -> { registered: bool, lastSeen: Date, options: {} }

function getDevice(sn) {
    if (!devices.has(sn)) {
        devices.set(sn, { registered: false, lastSeen: null, options: {} });
    }
    return devices.get(sn);
}

// --------------------------------------------------
// CONNECTION TRACKING
// Tags every underlying TCP socket with an id and a
// counter of how many requests it has served, so we can
// tell whether the device is reusing one keep-alive
// connection or opening a new one every cycle.
// --------------------------------------------------
let nextSocketId = 1;
const socketMeta = new WeakMap();

function tagSocket(socket) {
    if (!socketMeta.has(socket)) {
        socketMeta.set(socket, {
            id: nextSocketId++,
            opened: new Date(),
            requestCount: 0,
        });
        console.log(
            `\n🔌 NEW TCP CONNECTION #${socketMeta.get(socket).id} from ${socket.remoteAddress}:${socket.remotePort}`
        );
        socket.on("close", () => {
            const meta = socketMeta.get(socket);
            console.log(
                `🔌 TCP CONNECTION #${meta.id} CLOSED (served ${meta.requestCount} requests, open for ${(new Date() - meta.opened) / 1000}s)`
            );
        });
    }
    return socketMeta.get(socket);
}

let lastRequestTime = null;

// --------------------------------------------------
// COMMAND QUEUE
// SN -> array of raw command strings waiting to be
// delivered on the device's next GET /iclock/getrequest.
// --------------------------------------------------
const commandQueues = new Map();

function queueCommand(sn, cmd) {
    if (!commandQueues.has(sn)) commandQueues.set(sn, []);
    commandQueues.get(sn).push(cmd);
}

function drainCommands(sn) {
    const q = commandQueues.get(sn) || [];
    commandQueues.set(sn, []);
    return q;
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const path = parsedUrl.pathname;
    const query = Object.fromEntries(parsedUrl.searchParams.entries());

    const meta = tagSocket(req.socket);
    meta.requestCount += 1;

    const now = new Date();
    const gapMs = lastRequestTime ? now - lastRequestTime : null;
    lastRequestTime = now;

    console.log("\n========================================");
    console.log(`${req.method} ${req.url}`);
    console.log(
        `[conn #${meta.id}, request #${meta.requestCount} on this conn, +${gapMs === null ? "n/a" : gapMs + "ms"} since last request]`
    );
    console.log("========================================");
    console.log("Headers:", req.headers);

    // --------------------------------------------------
    // PHASE 1: DEVICE HANDSHAKE
    // GET /iclock/cdata
    // --------------------------------------------------
    if (req.method === "GET" && path === "/iclock/cdata") {
        const sn = query.SN || "UNKNOWN";
        const device = getDevice(sn);
        device.lastSeen = new Date();

        console.log("→ Handshake from device:", sn);
        console.log("→ pushver:", query.pushver);
        console.log("→ DeviceType:", query.DeviceType);
        console.log("→ PushOptionsFlag:", query.PushOptionsFlag);
        console.log("→ Already registered?", device.registered);

        // Isolating one variable at a time: a verified real face scan produced
        // no push at all, even with the Go reference server (also bare "OK")
        // listening. Testing whether this firmware needs an explicit signal
        // to start pushing live events, rather than assuming that's the
        // default when the field is omitted.
        const response = "OK\nRealtime=1";

        console.log("\n← Sending handshake response:", JSON.stringify(response));

        res.writeHead(200, {
            "Content-Type": "text/plain",
            "Content-Length": Buffer.byteLength(response),
            "Connection": "keep-alive",
        });

        return res.end(response);
    }

    // --------------------------------------------------
    // PHASE 2: DEVICE REGISTRATION
    // POST /iclock/registry
    // --------------------------------------------------
    if (req.method === "POST" && path === "/iclock/registry") {
        const sn = query.SN || "UNKNOWN";
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            console.log("\n→ Registration body:");
            console.log(body);

            const device = getDevice(sn);
            device.registered = true;
            device.lastSeen = new Date();

            // Parse the comma-separated key=value payload for
            // later inspection/debugging.
            body.split(",").forEach((pair) => {
                const idx = pair.indexOf("=");
                if (idx === -1) return;
                let key = pair.slice(0, idx).trim();
                const value = pair.slice(idx + 1).trim();
                if (key.startsWith("~")) key = key.slice(1);
                device.options[key] = value;
            });

            console.log("→ Marked device as registered:", sn);
            console.log("\n← Registration response: OK");

            const response = "OK";
            res.writeHead(200, {
                "Content-Type": "text/plain",
                "Content-Length": Buffer.byteLength(response),
                "Connection": "keep-alive",
            });
            res.end(response);
        });

        return;
    }

    // --------------------------------------------------
    // PHASE 3: DEVICE POLLS FOR COMMANDS
    // GET /iclock/getrequest
    // --------------------------------------------------
    if (req.method === "GET" && path === "/iclock/getrequest") {
        const sn = query.SN || "UNKNOWN";
        const device = getDevice(sn);
        device.lastSeen = new Date();

        console.log("→ getrequest from:", sn);

        const pending = drainCommands(sn);
        // Command wire format is "C:<id>:<cmd>\n" per line (verified against
        // real device traffic, see s0x90/zkteco-adms datasheet). Plain "OK"
        // (no trailing newline) when nothing is queued, matching that same
        // reference server.
        const response = pending.length > 0 ? pending.map((cmd) => `${cmd}\n`).join("") : "OK";

        if (pending.length > 0) {
            console.log(`🎯 DELIVERING ${pending.length} QUEUED COMMAND(S):`);
            console.log(response);
        } else {
            console.log("← Sending: OK (no commands queued)");
        }

        res.writeHead(200, {
            "Content-Type": "text/plain",
            "Content-Length": Buffer.byteLength(response),
            "Connection": "keep-alive",
        });

        return res.end(response);
    }

    // --------------------------------------------------
    // DEBUG: queue a test command for a device
    // GET /debug/queue-command?SN=xxx&cmd=CHECK
    // --------------------------------------------------
    if (req.method === "GET" && path === "/debug/queue-command") {
        const sn = query.SN || "UNKNOWN";
        const cmd = query.cmd || "CHECK";
        queueCommand(sn, cmd);
        console.log(`\n📥 Queued command for ${sn}: "${cmd}"`);
        const body = `Queued "${cmd}" for ${sn}. Waiting for device's next getrequest poll.\n`;
        res.writeHead(200, { "Content-Type": "text/plain" });
        return res.end(body);
    }

    // --------------------------------------------------
    // PHASE 4: DEVICE DATA
    // POST /iclock/cdata
    // --------------------------------------------------
    if (req.method === "POST" && path === "/iclock/cdata") {
        const sn = query.SN || "UNKNOWN";
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            console.log("\n→ DATA received:");
            console.log(body);

            const device = getDevice(sn);
            device.lastSeen = new Date();

            console.log("\n← Sending: OK");
            const response = "OK\n";
            res.writeHead(200, {
                "Content-Type": "text/plain",
                "Content-Length": Buffer.byteLength(response),
            });
            res.end(response);
        });

        return;
    }

    // --------------------------------------------------
    // PHASE 5: COMMAND RESULT
    // POST /iclock/devicecmd
    // --------------------------------------------------
    if (req.method === "POST" && path === "/iclock/devicecmd") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk.toString();
        });

        req.on("end", () => {
            console.log("\n→ Device command result:");
            console.log(body);

            const response = "OK\n";
            res.writeHead(200, {
                "Content-Type": "text/plain",
                "Content-Length": Buffer.byteLength(response),
            });
            res.end(response);
        });

        return;
    }

    // --------------------------------------------------
    // DEBUG: current device state snapshot
    // GET /debug/devices
    // --------------------------------------------------
    if (req.method === "GET" && path === "/debug/devices") {
        const snapshot = {};
        for (const [sn, d] of devices.entries()) {
            snapshot[sn] = d;
        }
        const body = JSON.stringify(snapshot, null, 2);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(body);
    }

    // --------------------------------------------------
    // UNKNOWN ENDPOINT
    // --------------------------------------------------
    console.log("⚠️ Unknown endpoint:", path);

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("NOT FOUND");
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

// Node's http.Server defaults to a 5000ms keepAliveTimeout, which closes any
// idle persistent connection after 5s. Every observed connection from the
// device stayed open for ~6s before closing - suspiciously close to that
// default - meaning our own server may be killing the socket right as the
// device pauses before reusing it for its next request (e.g. getrequest).
// headersTimeout must exceed keepAliveTimeout or Node throws at startup.
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.listen(PORT, HOST, () => {
    console.log("========================================");
    console.log(" ZKTeco ADMS Server");
    console.log("========================================");
    console.log(`Listening on ${HOST}:${PORT}`);
    console.log(`Device should connect to: 192.168.1.100:${PORT}`);
    console.log(`Debug device state at: http://192.168.1.100:${PORT}/debug/devices`);
    console.log("========================================\n");
});

// --------------------------------------------------
// ERROR HANDLING
// --------------------------------------------------

server.on("error", (err) => {
    console.error("Server error:", err);
});
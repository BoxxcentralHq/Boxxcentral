import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // produces .next/standalone — a pruned server bundle for the Docker image
  output: "standalone",
  images: {
    /*
     * Allowed `quality` values for next/image. Photography site-wide is
     * served at 100 (see <SiteImage>); 75 stays available as the default
     * for anything that doesn't opt in.
     */
    qualities: [75, 100],
    // menu item photos are uploaded to Cloudinary by the backend
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;

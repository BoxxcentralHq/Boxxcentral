import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Injectable()
export class AppService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getRoot() {
    return { name: 'BoxxCentral API', version: 'v1' };
  }

  getHealth() {
    const databaseConnected =
      this.connection.readyState === ConnectionStates.connected;
    return {
      status: databaseConnected ? ('ok' as const) : ('degraded' as const),
      database: databaseConnected
        ? ('connected' as const)
        : ('disconnected' as const),
      uptime: process.uptime(),
    };
  }
}

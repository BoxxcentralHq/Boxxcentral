import {
  Controller,
  Get,
  ServiceUnavailableException,
  Version,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Version(VERSION_NEUTRAL)
  @Get()
  getRoot() {
    return {
      message: 'Welcome to the BoxxCentral API',
      data: this.appService.getRoot(),
    };
  }

  @Version(VERSION_NEUTRAL)
  @Get('health')
  getHealth() {
    const health = this.appService.getHealth();
    if (health.status !== 'ok') {
      throw new ServiceUnavailableException({
        message: 'Service degraded — database disconnected',
        data: health,
      });
    }
    return { message: 'Service healthy', data: health };
  }
}

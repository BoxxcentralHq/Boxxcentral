import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { ServiceUnavailableException } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let connection: { readyState: number };

  beforeEach(async () => {
    connection = { readyState: 1 };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('identifies the API', () => {
      expect(appController.getRoot()).toEqual({
        message: 'Welcome to the BoxxCentral API',
        data: { name: 'BoxxCentral API', version: 'v1' },
      });
    });
  });

  describe('health', () => {
    it('reports healthy when the database is connected', () => {
      expect(appController.getHealth()).toMatchObject({
        message: 'Service healthy',
        data: { status: 'ok', database: 'connected' },
      });
    });

    it('throws 503 when the database is disconnected', () => {
      connection.readyState = 0;
      expect(() => appController.getHealth()).toThrow(
        ServiceUnavailableException,
      );
    });
  });
});

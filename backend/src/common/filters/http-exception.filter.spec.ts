import {
  Body,
  Controller,
  Get,
  INestApplication,
  NotFoundException,
  Post,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from './http-exception.filter';

@Controller('probe')
class ProbeController {
  @Get('crash')
  crash() {
    throw new Error('connection refused 10.0.0.5:27017');
  }

  @Get('missing')
  missing() {
    throw new NotFoundException('Screening not found');
  }

  @Post('echo')
  echo(@Body() body: unknown) {
    return body;
  }
}

async function createApp(): Promise<INestApplication<App>> {
  const moduleRef = await Test.createTestingModule({
    controllers: [ProbeController],
  }).compile();
  const app = moduleRef.createNestApplication<INestApplication<App>>({
    logger: false,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();
  return app;
}

describe('HttpExceptionFilter', () => {
  const originalEnv = process.env.NODE_ENV;
  let app: INestApplication<App>;

  afterEach(async () => {
    process.env.NODE_ENV = originalEnv;
    await app.close();
  });

  it('hides internal error messages in production', async () => {
    process.env.NODE_ENV = 'production';
    app = await createApp();

    const res = await request(app.getHttpServer())
      .get('/probe/crash')
      .expect(500);

    expect(res.body).toMatchObject({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
      error: { statusCode: 500, type: 'InternalServerError' },
    });
    expect(JSON.stringify(res.body)).not.toContain('10.0.0.5');
  });

  it('shows internal error messages outside production', async () => {
    process.env.NODE_ENV = 'development';
    app = await createApp();

    const res = await request(app.getHttpServer())
      .get('/probe/crash')
      .expect(500);

    expect(res.body).toMatchObject({
      error: { details: 'connection refused 10.0.0.5:27017' },
    });
  });

  it('keeps expected error messages for the client', async () => {
    process.env.NODE_ENV = 'production';
    app = await createApp();

    const res = await request(app.getHttpServer())
      .get('/probe/missing?ref=abc')
      .expect(404);

    expect(res.body).toMatchObject({
      message: 'Screening not found',
      error: { details: 'Screening not found', path: '/probe/missing' },
    });
  });

  it('never echoes the query string', async () => {
    process.env.NODE_ENV = 'production';
    app = await createApp();

    const res = await request(app.getHttpServer())
      .get('/nope?token=SECRET')
      .expect(404);

    expect(res.body).toMatchObject({ error: { path: '/nope' } });
    expect(JSON.stringify(res.body)).not.toContain('SECRET');
  });

  it('answers malformed JSON with 400, not 500', async () => {
    process.env.NODE_ENV = 'production';
    app = await createApp();

    const res = await request(app.getHttpServer())
      .post('/probe/echo')
      .set('Content-Type', 'application/json')
      .send('{"broken":')
      .expect(400);

    expect(res.body).toMatchObject({
      success: false,
      error: { statusCode: 400 },
    });
  });
});

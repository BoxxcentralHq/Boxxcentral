import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

type PinoRequest = Request & {
  log: {
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
  };
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<PinoRequest>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[];
    let data: unknown = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const body = exceptionResponse as {
          message?: string | string[];
          data?: unknown;
        };
        message = body.message ?? 'An error occurred';
        data = body.data ?? null;
      } else {
        message = exceptionResponse;
      }
    } else {
      message = 'An unexpected error occurred. Please try again later.';
    }

    const path = request.url.split('?')[0];
    const scrub = (text: string) => text.replaceAll(request.url, path);
    const apiMessage = scrub(Array.isArray(message) ? message[0] : message);
    const exposeInternals = process.env.NODE_ENV !== 'production';

    let type = 'InternalServerError';
    let details = apiMessage;
    if (exception instanceof HttpException) {
      type = exception.name;
      details = scrub(exception.message);
    } else if (exposeInternals && exception instanceof Error) {
      type = exception.name;
      details = exception.message;
    }

    response.locals.apiMessage = apiMessage;

    const err =
      exception instanceof Error ? exception : new Error(String(exception));
    if (!(exception instanceof HttpException) || status >= 500) {
      request.log?.error({ err, status }, apiMessage);
    } else if (status >= 400) {
      request.log?.warn({ status }, apiMessage);
    }

    response.status(status).json({
      success: false,
      message: apiMessage,
      data,
      error: {
        statusCode: status,
        type,
        details,
        path,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

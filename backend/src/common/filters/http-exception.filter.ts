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

    const apiMessage = Array.isArray(message) ? message[0] : message;

    // Stash on locals so pino-http's customSuccessMessage can pick it up
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
        type: exception instanceof Error ? exception.name : 'Error',
        details: exception instanceof Error ? exception.message : message,
        path: request.url,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

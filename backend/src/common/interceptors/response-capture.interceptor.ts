import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// stashes the serialized response body on res.locals — pino-http's
// customSuccessMessage only sees the raw HTTP response, not what Nest
// actually sent, so this is the bridge between the two
@Injectable()
export class ResponseCaptureInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();
    return next
      .handle()
      .pipe(tap((body: unknown) => (res.locals.responseBody = body)));
  }
}

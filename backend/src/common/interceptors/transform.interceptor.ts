import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: null;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const res = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((payload: { message?: string; data?: T } | undefined) => {
        const message = payload?.message ?? 'Request successful';
        res.locals.apiMessage = message;
        return {
          success: true,
          message,
          data: payload?.data ?? null,
          error: null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import type { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { BookingsModule } from './bookings/bookings.module';
import { CinemaModule } from './cinema/cinema.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ContactModule } from './contact/contact.module';
import { EmailModule } from './email/email.module';
import { FlutterwaveModule } from './flutterwave/flutterwave.module';
import { MenuModule } from './menu/menu.module';
import { PaymentsModule } from './payments/payments.module';

const dbLogger = new Logger('Database');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        // never log credentials or session cookies
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined // raw JSON in production
            : { target: 'pino-pretty', options: { singleLine: true } },
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () =>
            dbLogger.log(`MongoDB connected — database "${connection.name}"`),
          );
          connection.on('error', (err: Error) =>
            dbLogger.error(`MongoDB connection error: ${err.message}`),
          );
          connection.on('disconnected', () =>
            dbLogger.warn('MongoDB disconnected'),
          );
          return connection;
        },
      }),
    }),
    // Default rate limit: 20 requests / 10s per IP (login is stricter via @Throttle)
    ThrottlerModule.forRoot([{ ttl: 10000, limit: 20 }]),
    CloudinaryModule,
    EmailModule,
    FlutterwaveModule,
    AdminModule,
    PaymentsModule,
    CinemaModule,
    BookingsModule,
    ContactModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

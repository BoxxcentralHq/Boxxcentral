import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

export interface BookingConfirmationEmail {
  guestName: string;
  guestEmail: string;
  bookingRef: string;
  experience: string;
  date: string;
  timeSlot: string;
  guests: number;
  totalPrice: number;
}

type Sender = 'bookings' | 'noreply';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiUrl: string;
  private readonly token: string | undefined;
  private readonly senders: Record<Sender, { address: string; name: string }>;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.apiUrl =
      configService.get<string>('ZEPTOMAIL_URL') ??
      'https://api.zeptomail.com/';
    this.token = configService.get<string>('ZEPTOMAIL_TOKEN');

    const fromName =
      configService.get<string>('MAIL_FROM_NAME') ?? 'BoxxCentral';
    this.senders = {
      bookings: {
        address:
          configService.get<string>('MAIL_FROM') ?? 'bookings@boxxcentral.com',
        name: fromName,
      },
      noreply: {
        address:
          configService.get<string>('MAIL_NOREPLY') ??
          'noreply@boxxcentral.com',
        name: fromName,
      },
    };
  }

  private async send(
    to: { address: string; name: string },
    subject: string,
    htmlbody: string,
    from: Sender = 'bookings',
  ) {
    if (!this.token) {
      throw new InternalServerErrorException('Email service not configured');
    }

    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}v1.1/email`,
          {
            from: this.senders[from],
            to: [{ email_address: to }],
            subject,
            htmlbody,
          },
          {
            headers: {
              Authorization: this.token,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      this.logger.log(`Email sent to ${to.address}: ${subject}`);
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        'ZeptoMail send failed',
        err.response?.data ?? err.message,
      );
      throw new InternalServerErrorException('Could not send email');
    }
  }

  private bookingConfirmationHtml(data: BookingConfirmationEmail): string {
    const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
    return `
      <div style="background:#0a0a0b;color:#fafafa;font-family:Arial,Helvetica,sans-serif;padding:32px;">
        <h1 style="margin:0 0 4px;">Boxx<span style="color:#e4212e;">Central</span></h1>
        <p style="color:#a6a6b0;margin:0 0 24px;">Your FilmBoxx booking is confirmed.</p>
        <div style="background:#121216;border:1px solid #26262e;border-radius:12px;padding:24px;">
          <p style="font-size:20px;margin:0 0 16px;">Booking reference:
            <strong style="color:#e4212e;">${data.bookingRef}</strong>
          </p>
          <p style="margin:4px 0;">Guest: ${data.guestName}</p>
          <p style="margin:4px 0;">Date: ${data.date} at ${data.timeSlot}</p>
          <p style="margin:4px 0;">Guests: ${data.guests}</p>
          <p style="margin:4px 0;">Total paid: ${naira(data.totalPrice)}</p>
        </div>
        <p style="color:#a6a6b0;margin:24px 0 0;">
          Show this reference at the door. Please arrive on time — your session
          starts at the scheduled reservation time.
        </p>
      </div>`;
  }

  async sendBookingConfirmation(data: BookingConfirmationEmail) {
    await this.send(
      { address: data.guestEmail, name: data.guestName },
      `Your FilmBoxx booking ${data.bookingRef} is confirmed`,
      this.bookingConfirmationHtml(data),
    );
  }
}

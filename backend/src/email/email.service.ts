import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

const LOGO_URL =
  'https://res.cloudinary.com/tg9rwuoe/image/upload/v1785553610/boxxcentral/brand/logo.png';
const SITE_NAME = 'BoxxCentral';
const SITE_ADDRESS = 'Fadeyi Estate off Ilesa Road, Osogbo, Osun State';
const SITE_PHONE = '+234 706 349 2072';
const SITE_EMAIL = 'info@boxxcentral.com';

export interface BookingConfirmationEmail {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingRef: string;
  experience: string;
  room: string;
  date: string;
  timeSlot: string;
  guests: number;
  subtotal: number;
  vatAmount: number;
  totalPrice: number;
}

export interface MembershipPaymentReceiptEmail {
  memberName: string;
  memberEmail: string;
  subscriptionRef: string;
  planName: string;
  durationDays: number;
  price: number;
}

export interface MembershipActivatedEmail {
  memberName: string;
  memberEmail: string;
  subscriptionRef: string;
  planName: string;
  startDate: Date;
  endDate: Date;
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
    const issuedOn = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const cell = 'padding:10px 0;font-size:14px;color:#3a3a3a;';
    const label =
      'padding:10px 0;font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#8a8a8a;';
    const heading =
      "font-family:'Anton',Impact,'Arial Narrow Bold',sans-serif;";
    const body = "font-family:'Figtree',Arial,Helvetica,sans-serif;";

    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Figtree:wght@400;500;600;700&display=swap');
      </style>
      <div style="background:#f4f2ee;padding:32px 16px;${body}">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6e2da;border-radius:16px;overflow:hidden;${body}">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:2px solid #e4212e;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="${LOGO_URL}" alt="BoxxCentral" height="36" style="display:block;" />
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:26px;font-weight:normal;letter-spacing:0.04em;color:#111111;${heading}">BOOKING RECEIPT</p>
                    <p style="margin:2px 0 0;font-size:12px;color:#8a8a8a;">${issuedOn}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#3a3a3a;">
                <tr>
                  <td style="padding:2px 0;color:#8a8a8a;">Receipt number</td>
                  <td align="right" style="padding:2px 0;font-weight:bold;color:#111111;">${data.bookingRef}</td>
                </tr>
                <tr>
                  <td style="padding:2px 0;color:#8a8a8a;">Issued by</td>
                  <td align="right" style="padding:2px 0;">${SITE_NAME}, ${SITE_ADDRESS}</td>
                </tr>
                <tr>
                  <td style="padding:2px 0;color:#8a8a8a;">Contact</td>
                  <td align="right" style="padding:2px 0;">${SITE_PHONE} · ${SITE_EMAIL}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#e4212e;">Invoice to</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#3a3a3a;">
                <tr><td style="padding:2px 0;">${data.guestName}</td></tr>
                <tr><td style="padding:2px 0;color:#8a8a8a;">${data.guestEmail}</td></tr>
                <tr><td style="padding:2px 0;color:#8a8a8a;">${data.guestPhone}</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr style="background:#f4f2ee;">
                  <td style="${label}padding-left:12px;border-radius:8px 0 0 8px;">Description</td>
                  <td style="${label}" align="center">Guests</td>
                  <td style="${label}padding-right:12px;border-radius:0 8px 8px 0;" align="right">Amount</td>
                </tr>
                <tr>
                  <td style="${cell}padding-left:12px;border-bottom:1px solid #eeece7;">
                    FilmBoxx Private Cinema — ${data.room}<br/>
                    <span style="color:#8a8a8a;font-size:12px;">${data.date} at ${data.timeSlot}</span>
                  </td>
                  <td style="${cell}border-bottom:1px solid #eeece7;" align="center">${data.guests}</td>
                  <td style="${cell}padding-right:12px;border-bottom:1px solid #eeece7;" align="right">${naira(data.subtotal)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                <tr>
                  <td></td>
                  <td width="180" style="padding:4px 0;color:#8a8a8a;">Subtotal</td>
                  <td width="120" style="padding:4px 0;" align="right">${naira(data.subtotal)}</td>
                </tr>
                <tr>
                  <td></td>
                  <td style="padding:4px 0;color:#8a8a8a;">VAT</td>
                  <td style="padding:4px 0;" align="right">${naira(data.vatAmount)}</td>
                </tr>
                <tr>
                  <td></td>
                  <td style="padding:10px 0;font-weight:bold;color:#111111;border-top:2px solid #111111;">Total paid</td>
                  <td style="padding:10px 0;font-weight:bold;color:#e4212e;border-top:2px solid #111111;" align="right">${naira(data.totalPrice)}</td>
                </tr>
                <tr>
                  <td></td>
                  <td style="padding:2px 0;color:#8a8a8a;font-size:11px;">Payment method</td>
                  <td style="padding:2px 0;font-size:11px;" align="right">Flutterwave</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 32px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8a8a8a;">
                Show this receipt (or your booking reference) at the door. Please arrive on time —
                your session starts promptly at the scheduled reservation time.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px;background:#111111;">
              <p style="margin:0;font-size:11px;color:#8a8a8a;">${SITE_NAME} · ${SITE_ADDRESS}</p>
            </td>
          </tr>
        </table>
      </div>`;
  }

  async sendBookingConfirmation(data: BookingConfirmationEmail) {
    await this.send(
      { address: data.guestEmail, name: data.guestName },
      `Your FilmBoxx booking ${data.bookingRef} is confirmed`,
      this.bookingConfirmationHtml(data),
    );
  }

  /** Shared header/footer chrome for both membership emails. */
  private membershipEmailShell(heading: string, bodyRows: string): string {
    const headingFont =
      "font-family:'Anton',Impact,'Arial Narrow Bold',sans-serif;";
    const body = "font-family:'Figtree',Arial,Helvetica,sans-serif;";
    const issuedOn = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Figtree:wght@400;500;600;700&display=swap');
      </style>
      <div style="background:#f4f2ee;padding:32px 16px;${body}">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6e2da;border-radius:16px;overflow:hidden;${body}">
          <tr>
            <td style="padding:32px 32px 24px;border-bottom:2px solid #e4212e;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <img src="${LOGO_URL}" alt="BoxxCentral" height="36" style="display:block;" />
                  </td>
                  <td align="right">
                    <p style="margin:0;font-size:26px;font-weight:normal;letter-spacing:0.04em;color:#111111;${headingFont}">${heading}</p>
                    <p style="margin:2px 0 0;font-size:12px;color:#8a8a8a;">${issuedOn}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${bodyRows}
          <tr>
            <td style="padding:16px 32px;background:#111111;">
              <p style="margin:0;font-size:11px;color:#8a8a8a;">${SITE_NAME} · ${SITE_ADDRESS}</p>
            </td>
          </tr>
        </table>
      </div>`;
  }

  private membershipPaymentReceiptHtml(
    data: MembershipPaymentReceiptEmail,
  ): string {
    const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
    const cell = 'padding:10px 0;font-size:14px;color:#3a3a3a;';
    const label =
      'padding:10px 0;font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#8a8a8a;';

    const rows = `
          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#3a3a3a;">
                <tr>
                  <td style="padding:2px 0;color:#8a8a8a;">Receipt number</td>
                  <td align="right" style="padding:2px 0;font-weight:bold;color:#111111;">${data.subscriptionRef}</td>
                </tr>
                <tr>
                  <td style="padding:2px 0;color:#8a8a8a;">Issued by</td>
                  <td align="right" style="padding:2px 0;">${SITE_NAME}, ${SITE_ADDRESS}</td>
                </tr>
                <tr>
                  <td style="padding:2px 0;color:#8a8a8a;">Contact</td>
                  <td align="right" style="padding:2px 0;">${SITE_PHONE} · ${SITE_EMAIL}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#e4212e;">Member</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#3a3a3a;">
                <tr><td style="padding:2px 0;">${data.memberName}</td></tr>
                <tr><td style="padding:2px 0;color:#8a8a8a;">${data.memberEmail}</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr style="background:#f4f2ee;">
                  <td style="${label}padding-left:12px;border-radius:8px 0 0 8px;">Plan</td>
                  <td style="${label}padding-right:12px;border-radius:0 8px 8px 0;" align="right">Amount</td>
                </tr>
                <tr>
                  <td style="${cell}padding-left:12px;border-bottom:1px solid #eeece7;">
                    GymBoxx — ${data.planName}<br/>
                    <span style="color:#8a8a8a;font-size:12px;">${data.durationDays} days</span>
                  </td>
                  <td style="${cell}padding-right:12px;border-bottom:1px solid #eeece7;" align="right">${naira(data.price)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;">
                <tr>
                  <td></td>
                  <td width="180" style="padding:10px 0;font-weight:bold;color:#111111;border-top:2px solid #111111;">Total paid</td>
                  <td style="padding:10px 0;font-weight:bold;color:#e4212e;border-top:2px solid #111111;" align="right">${naira(data.price)}</td>
                </tr>
                <tr>
                  <td></td>
                  <td style="padding:2px 0;color:#8a8a8a;font-size:11px;">Payment method</td>
                  <td style="padding:2px 0;font-size:11px;" align="right">Flutterwave</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 32px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8a8a8a;">
                Your payment is confirmed, but your ${data.durationDays}-day pass hasn't started yet —
                <strong style="color:#3a3a3a;">come by the gym and show this receipt (or your
                reference, ${data.subscriptionRef}) to the front desk to activate it.</strong>
                Your membership only starts counting down once it's activated.
              </p>
            </td>
          </tr>`;

    return this.membershipEmailShell('PAYMENT RECEIPT', rows);
  }

  private membershipActivatedHtml(data: MembershipActivatedEmail): string {
    const formatDate = (d: Date) =>
      d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    const cell = 'padding:10px 0;font-size:14px;color:#3a3a3a;';
    const label =
      'padding:10px 0;font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#8a8a8a;';

    const rows = `
          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#3a3a3a;">
                <tr>
                  <td style="padding:2px 0;color:#8a8a8a;">Reference</td>
                  <td align="right" style="padding:2px 0;font-weight:bold;color:#111111;">${data.subscriptionRef}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 8px;font-size:11px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#e4212e;">Member</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#3a3a3a;">
                <tr><td style="padding:2px 0;">${data.memberName}</td></tr>
                <tr><td style="padding:2px 0;color:#8a8a8a;">${data.memberEmail}</td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 32px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr style="background:#f4f2ee;">
                  <td style="${label}padding-left:12px;border-radius:8px 0 0 8px;">Plan</td>
                  <td style="${label}padding-right:12px;border-radius:0 8px 8px 0;" align="right">Valid through</td>
                </tr>
                <tr>
                  <td style="${cell}padding-left:12px;border-bottom:1px solid #eeece7;">GymBoxx — ${data.planName}</td>
                  <td style="${cell}padding-right:12px;border-bottom:1px solid #eeece7;" align="right">${formatDate(data.endDate)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 32px 32px;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8a8a8a;">
                You're all set — your membership is active from ${formatDate(data.startDate)}
                through ${formatDate(data.endDate)}. This is a one-time pass, not a recurring
                charge — come back and renew any time after it lapses.
              </p>
            </td>
          </tr>`;

    return this.membershipEmailShell('MEMBERSHIP ACTIVATED', rows);
  }

  async sendMembershipPaymentReceipt(data: MembershipPaymentReceiptEmail) {
    await this.send(
      { address: data.memberEmail, name: data.memberName },
      `Payment received — activate your GymBoxx membership ${data.subscriptionRef}`,
      this.membershipPaymentReceiptHtml(data),
    );
  }

  async sendMembershipActivated(data: MembershipActivatedEmail) {
    await this.send(
      { address: data.memberEmail, name: data.memberName },
      `Your GymBoxx membership ${data.subscriptionRef} is active`,
      this.membershipActivatedHtml(data),
    );
  }
}

import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  FlutterwaveInitializePayload,
  FlutterwaveVerifyResponse,
} from './types/flutterwave.types';

/** Flutterwave wraps every response as { status, message, data }. */
interface FlwEnvelope<T> {
  status: string;
  message: string;
  data: T;
}

/** Prefix for BoxxCentral transaction references (e.g. BXX-1721300000-AB12). */
export const TX_REF_PREFIX = 'BXX-';

const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

@Injectable()
export class FlutterwaveService {
  private readonly logger = new Logger(FlutterwaveService.name);
  private readonly secretKey: string | undefined;
  private readonly secretHash: string | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.secretKey = this.configService.get<string>('FLW_SECRET_KEY');
    this.secretHash = this.configService.get<string>('FLW_SECRET_HASH');
  }

  private get authHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializePayment(payload: FlutterwaveInitializePayload) {
    if (!this.secretKey) {
      throw new InternalServerErrorException('Payment gateway not configured');
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<FlwEnvelope<{ link: string }>>(
          `${FLW_BASE_URL}/payments`,
          payload,
          { headers: this.authHeaders },
        ),
      );
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(
        'Flutterwave initialization failed',
        err.response?.data ?? err.message,
      );
      throw new InternalServerErrorException(
        'Could not connect to payment gateway',
      );
    }
  }

  async verifyTransaction(
    idOrRef: string,
  ): Promise<FlutterwaveVerifyResponse | null> {
    try {
      const isRef = idOrRef.startsWith(TX_REF_PREFIX);
      const url = isRef
        ? `${FLW_BASE_URL}/transactions/verify_by_reference?tx_ref=${idOrRef}`
        : `${FLW_BASE_URL}/transactions/${idOrRef}/verify`;

      const response = await firstValueFrom(
        this.httpService.get<FlwEnvelope<FlutterwaveVerifyResponse>>(url, {
          headers: this.authHeaders,
        }),
      );
      return response.data.data;
    } catch (error) {
      const err = error as AxiosError;
      this.logger.error(`Transaction verification failed for: ${idOrRef}`);
      this.logger.error(err.response?.data ?? err.message);
      return null;
    }
  }

  /** Validates the `verif-hash` header Flutterwave sends with webhooks. */
  validateSignature(signature: string): boolean {
    if (!signature || !this.secretHash) return false;
    return signature === this.secretHash;
  }
}

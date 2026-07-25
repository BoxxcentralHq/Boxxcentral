export interface FlutterwaveCustomer {
  email: string;
  phonenumber: string;
  name: string;
}

export interface FlutterwaveCustomizations {
  title: string;
  description: string;
  logo?: string;
}

export interface FlutterwaveInitializePayload {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  meta: {
    bookingId: string;
    experience: string;
  };
  customer: FlutterwaveCustomer;
  customizations: FlutterwaveCustomizations;
}

/**
 * Webhook payloads arrive in two shapes:
 * V3 (nested): { event: "charge.completed", data: { tx_ref, status, id } }
 * V2 (flat):   { txRef, status, id, "event.type": ... }
 * PaymentsService normalizes both.
 */
export interface FlutterwaveWebhookPayload {
  event?: string;
  'event.type'?: string;
  id?: number;
  txRef?: string;
  status?: string;
  data?: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    amount: number;
    currency: string;
    status: string;
    customer?: {
      name: string;
      email: string;
      phone_number?: string;
    };
  };
}

export interface FlutterwaveVerifyResponse {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed';
  payment_type: string;
  created_at: string;
}

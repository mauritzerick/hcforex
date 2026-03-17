/**
 * Payin API client. Calls the backend proxy; no credentials in the frontend.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export type PayinCurrency = 'IDR' | 'VND' | 'KRW' | 'JPY';

export interface PayinRequest {
  currency: string;
  amount: number;
  name: string;
  gst: boolean;
  email: string;
  external_id: string;
  payin_method_name: string;
  payin_method_params: Record<string, unknown>;
  description: string;
  webhook_notification: {
    endpoint_url: string;
    authorization_header: string;
  };
  expired_at: string;
  metadata?: Record<string, string>;
}

/** QR-based payin (IDR, VND) returns pay_code.qr_string */
export interface PayCodeQR {
  qr_string: string;
  [key: string]: unknown;
}

/** Bank/VA payin (KRW) returns pay_code with bank details – structure may vary by provider */
export interface PayCodeBank {
  qr_string?: never;
  bank_name?: string;
  bank_code?: string;
  account_number?: string;
  virtual_account_number?: string;
  account_holder_name?: string;
  reference_number?: string;
  reference?: string;
  user_name?: string;
  [key: string]: unknown;
}

export type PayCode = PayCodeQR | PayCodeBank;

export interface PayinResponse {
  uuid: string;
  name: string;
  email: string;
  external_id: string;
  status: string;
  pay_code: PayCode;
  currency: string;
  amount: string;
  total: string;
  paid_amount: string;
  is_refundable: boolean;
  payment_method: string;
  expired_at: string;
  status_text: string;
  description: string;
  gst: boolean;
  gst_amount: number;
  pay_by: string;
  metadata?: Record<string, string>;
}

export interface PayinVndParams {
  ip_address: string;
  phone: string;
}

export interface PayinKrwParams {
  user_name: string;
}

export interface PayinJpyParams {
  user_name: string;
}

export async function createPayin(
  amount: number,
  currency: PayinCurrency,
  params?: PayinVndParams | PayinKrwParams | PayinJpyParams
): Promise<PayinResponse> {
  const body: Record<string, unknown> = {
    currency,
    amount,
  };
  if (currency === 'VND' && params) {
    body.vndParams = params;
  }
  if (currency === 'KRW' && params) {
    body.krwParams = params;
  }
  if (currency === 'JPY' && params) {
    body.jpyParams = params;
  }

  const res = await fetch(`${API_BASE}/api/payins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data.error === 'string'
        ? data.error
        : typeof data.message === 'string'
          ? data.message
          : data.errors
            ? JSON.stringify(data.errors)
            : `Payin failed: ${res.status}`;
    throw new Error(msg);
  }
  return data as PayinResponse;
}

/** True if response has a QR code (IDR/VND); false if bank/VA details (KRW) */
export function payinHasQr(res: PayinResponse): res is PayinResponse & { pay_code: PayCodeQR } {
  return typeof (res.pay_code as PayCodeQR).qr_string === 'string';
}

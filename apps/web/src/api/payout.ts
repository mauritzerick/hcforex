/**
 * Payout API types and payload builder.
 * This is MOCK only: we build and display the payload but do NOT POST.
 */

export const PAYOUT_ENDPOINT = 'https://api-merchant.helloclever.co/api/v2/payouts';

export interface PayoutMethodParams {
  bank_code: string;
  account_number: string;
  account_name: string;
  description: string;
}

export interface PayoutTransactionDetail {
  first_name: string;
  last_name: string;
  email: string;
  amount: number;
  payout_method_params: PayoutMethodParams;
  external_id: string | null;
}

export interface PayoutRequest {
  payout_transaction_details: PayoutTransactionDetail[];
  currency: string;
  payout_method_name: string;
  description: string;
  webhook_notification: {
    endpoint_url: string;
    authorization_header: string;
  };
  external_id: string;
}

export interface PayoutPayloadDisplay {
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body: PayoutRequest;
}

export interface PayoutFormData {
  amount: string;
  first_name: string;
  last_name: string;
  email: string;
  bank_code: string;
  account_number: string;
  account_name: string;
  description: string;
  external_id: string;
}

const DEFAULT_WEBHOOK = {
  endpoint_url: 'https://yourserver.co/notifications',
  authorization_header: '****',
};

export function buildPayoutPayload(form: PayoutFormData): PayoutPayloadDisplay {
  const amountNum = parseInt(form.amount.replace(/\D/g, ''), 10) || 0;
  const body: PayoutRequest = {
    payout_transaction_details: [
      {
        first_name: form.first_name.trim() || 'Clever',
        last_name: form.last_name.trim() || 'Hello',
        email: form.email.trim() || 'test@example.com',
        amount: amountNum,
        payout_method_params: {
          bank_code: form.bank_code.trim() || 'BMRIIDJA',
          account_number: form.account_number.trim() || '0036003503467',
          account_name: form.account_name.trim() || 'Deeles',
          description: form.description.trim() || 'Test',
        },
        external_id: form.external_id.trim() || null,
      },
    ],
    currency: 'IDR',
    payout_method_name: 'id_bank_idr',
    description: form.description.trim() || 'Test payout',
    webhook_notification: DEFAULT_WEBHOOK,
    external_id: form.external_id.trim() || '123',
  };

  return {
    endpoint: PAYOUT_ENDPOINT,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'app-id': 'app-25db67c5657914454081c6a18e93d6dd',
      'secret-key': 'AK_PROD_****... (hidden)',
    },
    body,
  };
}

export const defaultPayoutForm: PayoutFormData = {
  amount: '100000',
  first_name: 'Clever',
  last_name: 'Hello',
  email: 'test@example.com',
  bank_code: 'BMRIIDJA',
  account_number: '0036003503467',
  account_name: 'Deeles',
  description: 'Test payout',
  external_id: '123',
};

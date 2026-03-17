import type { Request, Response } from 'express';
import { getCredentials, getConfig } from '../config.js';

const WEBHOOK = {
  endpoint_url: 'https://yourserver.co/notifications',
  authorization_header: '****',
};

function getExpiredAt(): string {
  const d = new Date();
  d.setHours(d.getHours() + 1);
  return d.toISOString().replace(/\.\d{3}/, '.000').replace('Z', '+0000');
}

export interface CreatePayinBody {
  currency: 'IDR' | 'VND' | 'KRW' | 'JPY';
  amount: number;
  vndParams?: { phone?: string; ip_address?: string };
  krwParams?: { user_name?: string };
  jpyParams?: {
    user_id?: string;
    user_name?: string;
    ip_address?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
  };
}

function buildPayinBody(body: CreatePayinBody): Record<string, unknown> {
  const { currency, amount, vndParams, krwParams, jpyParams } = body;
  const base = {
    currency,
    amount,
    name: 'Mauritz Erick',
    gst: false,
    email: 'mauritz.erick@gmail.com',
    external_id: `ext-${Date.now()}`,
    description: `Deposit ${currency}`,
    webhook_notification: WEBHOOK,
    expired_at: getExpiredAt(),
  };

  if (currency === 'IDR') {
    return {
      ...base,
      payin_method_name: 'id_bank_qris_idr',
      payin_method_params: {},
      metadata: { custom_note: 'Forex deposit' },
    };
  }

  if (currency === 'VND') {
    return {
      ...base,
      payin_method_name: 'vn_vietqr_vnd',
      payin_method_params: {
        ip_address: vndParams?.ip_address ?? '134.168.161.19',
        phone: vndParams?.phone ?? '0123456789',
      },
    };
  }

  if (currency === 'KRW') {
    return {
      ...base,
      payin_method_name: 'kr_bank_krw',
      payin_method_params: {
        user_name: krwParams?.user_name ?? 'Jeon',
      },
    };
  }

  if (currency === 'JPY') {
    return {
      ...base,
      payin_method_name: 'jp_bank_jpy',
      payin_method_params: {
        user_id: jpyParams?.user_id ?? 'mau',
        user_name: jpyParams?.user_name ?? 'User',
        ip_address: jpyParams?.ip_address ?? '134.168.161.19',
        first_name: jpyParams?.first_name ?? 'マウリッツ',
        last_name: jpyParams?.last_name ?? 'エリック',
        phone: jpyParams?.phone ?? '09012345678',
        email: jpyParams?.email ?? base.email,
      },
    };
  }

  throw new Error(`Unsupported currency: ${currency}`);
}

export async function createPayin(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as CreatePayinBody;
    const { currency, amount } = body;
    if (!currency || !['IDR', 'VND', 'KRW', 'JPY'].includes(currency) || typeof amount !== 'number') {
      res.status(400).json({ error: 'Invalid body: currency (IDR|VND|KRW|JPY) and amount (number) required' });
      return;
    }

    const { appId, secretKey } = getCredentials(currency);
    const payload = buildPayinBody(body);
    const { hellocleverBase: baseUrl } = getConfig();

    const response = await fetch(`${baseUrl}/payins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'app-id': appId,
        'secret-key': secretKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payin failed';
    res.status(500).json({ error: message });
  }
}

import type { IncomingMessage, ServerResponse } from 'http';

type VercelRequest = IncomingMessage & { body?: unknown; method?: string; url?: string };
type VercelResponse = ServerResponse;

function getCredentials(currency: string): { appId: string; secretKey: string } {
  const appIdKey = `HELLOCLEVER_APP_ID_${currency}`;
  const secretKeyKey = `HELLOCLEVER_SECRET_KEY_${currency}`;
  const appId = process.env[appIdKey] ?? '';
  const secretKey = process.env[secretKeyKey] ?? '';
  if (!appId || !secretKey) {
    throw new Error(
      `Missing Hello Clever credentials for ${currency}. Set ${appIdKey} and ${secretKeyKey} in Vercel Environment Variables.`
    );
  }
  return { appId, secretKey };
}

const BASE_URL = process.env.HELLOCLEVER_BASE_URL ?? 'https://api-merchant.helloclever.co/api/v2';

function parseQuery(url: string): Record<string, string> {
  const i = url.indexOf('?');
  if (i === -1) return {};
  const out: Record<string, string> = {};
  for (const part of url.slice(i + 1).split('&')) {
    const [k, v] = part.split('=');
    if (k && v) out[decodeURIComponent(k)] = decodeURIComponent(v);
  }
  return out;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const query = parseQuery(req.url ?? '');
    const uuid = query.uuid ?? '';
    const currency = query.currency ?? '';
    if (!uuid || !['IDR', 'VND', 'KRW', 'JPY'].includes(currency)) {
      res.status(400).json({ error: 'Query params uuid and currency (IDR|VND|KRW|JPY) required' });
      return;
    }
    const { appId, secretKey } = getCredentials(currency);
    const response = await fetch(`${BASE_URL}/payins/detail?uuid=${encodeURIComponent(uuid)}`, {
      method: 'GET',
      headers: {
        'app-id': appId,
        'secret-key': secretKey,
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      res.status(response.status).json(data);
      return;
    }
    res.status(200).json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load payin details';
    res.status(500).json({ error: message });
  }
}

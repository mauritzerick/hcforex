import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load apps/api/.env regardless of cwd (e.g. when run via npm run dev from repo root)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT ?? 3000;
const HELLOCLEVER_BASE = process.env.HELLOCLEVER_BASE_URL ?? 'https://api-merchant.helloclever.co/api/v2';

const APP_IDS: Record<string, string> = {
  IDR: process.env.HELLOCLEVER_APP_ID_IDR ?? '',
  VND: process.env.HELLOCLEVER_APP_ID_VND ?? '',
  KRW: process.env.HELLOCLEVER_APP_ID_KRW ?? '',
  JPY: process.env.HELLOCLEVER_APP_ID_JPY ?? '',
};

const SECRET_KEY = process.env.HELLOCLEVER_SECRET_KEY ?? '';

export function getConfig() {
  return {
    port: Number(PORT),
    hellocleverBase: HELLOCLEVER_BASE,
    appIds: APP_IDS,
    secretKey: SECRET_KEY,
  };
}

export function getCredentials(currency: string): { appId: string; secretKey: string } {
  const appId = APP_IDS[currency];
  if (!appId || !SECRET_KEY) {
    throw new Error(
      'Missing Hello Clever credentials. In apps/api/.env set HELLOCLEVER_APP_ID_IDR (and HELLOCLEVER_APP_ID_VND/KRW/JPY if needed) and HELLOCLEVER_SECRET_KEY, then restart the API.'
    );
  }
  return { appId, secretKey: SECRET_KEY };
}

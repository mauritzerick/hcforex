# Environment variables for payin API (Vercel serverless or apps/api)

Each currency has its own app ID and secret key. Set only the pairs for the currencies you use.

## Required per currency

| Env name | Currency |
|----------|----------|
| `HELLOCLEVER_APP_ID_IDR` | Indonesian Rupiah (QRIS) |
| `HELLOCLEVER_SECRET_KEY_IDR` | Secret for IDR |
| `HELLOCLEVER_APP_ID_VND` | Vietnamese Dong (VietQR) |
| `HELLOCLEVER_SECRET_KEY_VND` | Secret for VND |
| `HELLOCLEVER_APP_ID_KRW` | South Korean Won (bank transfer) |
| `HELLOCLEVER_SECRET_KEY_KRW` | Secret for KRW |
| `HELLOCLEVER_APP_ID_JPY` | Japanese Yen (bank transfer) |
| `HELLOCLEVER_SECRET_KEY_JPY` | Secret for JPY |

## Optional

| Env name | Default |
|----------|---------|
| `HELLOCLEVER_BASE_URL` | `https://api-merchant.helloclever.co/api/v2` |

In **Vercel**: Project → Settings → Environment Variables. Add each key for Production (and Preview if needed).

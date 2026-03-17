import { useState } from 'react';
import { createPayin, payinHasQr, type PayinResponse } from './api/payin';
import { qrStringToDataUrlWithFlag } from './utils/qr';
import './MobileIdrDepositPage.css';

const IDR_MIN_AMOUNT = 10000;
const IDR_QUICK_AMOUNTS = [50000, 100000, 250000, 500000, 1000000];

export function MobileIdrDepositPage() {
  const [amount, setAmount] = useState<string>('100000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payin, setPayin] = useState<PayinResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const handleAmountChange = (value: string) => {
    setAmount(value.replace(/\D/g, ''));
    setError(null);
  };

  const handleCreate = async () => {
    const num = parseInt(amount.replace(/\D/g, ''), 10);
    if (!num || num < IDR_MIN_AMOUNT) {
      setError('Minimum amount is IDR 10,000');
      return;
    }

    setLoading(true);
    setError(null);
    setPayin(null);
    setQrDataUrl(null);

    try {
      const res = await createPayin(num, 'IDR');
      setPayin(res);
      if (payinHasQr(res)) {
        const dataUrl = await qrStringToDataUrlWithFlag(res.pay_code.qr_string);
        setQrDataUrl(dataUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPayin(null);
    setQrDataUrl(null);
    setError(null);
  };

  const formattedAmount =
    payin && typeof payin.amount === 'string'
      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(
          Number(payin.amount),
        )
      : null;

  return (
    <div className="mobile-app">
      <header className="mobile-header">
        <div className="mobile-logo">HC-Forex</div>
        <p className="mobile-subtitle">IDR • Mobile deposit</p>
      </header>

      <main className="mobile-main">
        <section className="mobile-card">
          <h1 className="mobile-title">Top up balance</h1>
          <p className="mobile-copy">Enter the amount in IDR and we’ll generate a QRIS code you can scan.</p>

          <label className="mobile-input-group">
            <span className="mobile-input-label">Amount (IDR)</span>
            <input
              type="text"
              inputMode="numeric"
              className="mobile-input"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="100000"
            />
          </label>

          <div className="mobile-quick-amounts">
            {IDR_QUICK_AMOUNTS.map((n) => (
              <button
                key={n}
                type="button"
                className="mobile-chip"
                onClick={() => handleAmountChange(String(n))}
              >
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                }).format(n)}
              </button>
            ))}
          </div>

          {error && <p className="mobile-error">{error}</p>}

          <button
            type="button"
            className="mobile-button primary"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create QR'}
          </button>
        </section>

        {payin && (
          <section className="mobile-card mobile-qr-card">
            <div className="mobile-qr-header">
              <h2>Scan to pay</h2>
              {formattedAmount && <p className="mobile-amount">{formattedAmount}</p>}
            </div>

            <div className="mobile-qr-wrap">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="IDR QRIS code" className="mobile-qr-image" />
              ) : (
                <div className="mobile-qr-placeholder">Loading QR…</div>
              )}
            </div>

            <p className="mobile-qr-hint">Open your Indonesian banking or e-wallet app and scan this QRIS code.</p>

            <div className="mobile-meta">
              <div className="mobile-meta-row">
                <span>Reference</span>
                <code>{payin.uuid}</code>
              </div>
              <div className="mobile-meta-row">
                <span>Expires</span>
                <span>{new Date(payin.expired_at).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button
              type="button"
              className="mobile-button secondary full"
              onClick={handleReset}
            >
              New amount
            </button>
          </section>
        )}
      </main>
    </div>
  );
}


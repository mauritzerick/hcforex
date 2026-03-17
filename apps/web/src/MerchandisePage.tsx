import { useState } from 'react';
import { createPayin, payinHasQr, type PayinResponse } from './api/payin';
import { qrStringToDataUrl } from './utils/qr';
import capImg from '../cap.png';
import './MerchandisePage.css';

const IDR_MIN_AMOUNT = 10000;

export function MerchandisePage() {
  const [step, setStep] = useState<'product' | 'deposit'>('product');
  const [amount, setAmount] = useState<string>('150000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payin, setPayin] = useState<PayinResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const handleAmountChange = (value: string) => {
    setAmount(value.replace(/\D/g, ''));
    setError(null);
  };

  const handleAddToCart = async () => {
    const num = parseInt(amount.replace(/\D/g, ''), 10);
    if (!num || num < IDR_MIN_AMOUNT) {
      setError('Minimum deposit is IDR 10,000');
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
        const dataUrl = await qrStringToDataUrl(res.pay_code.qr_string);
        setQrDataUrl(dataUrl);
      }
      setStep('deposit');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Deposit request failed');
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(150000);

  const formattedPayinAmount =
    payin && typeof payin.amount === 'string'
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(Number(payin.amount))
      : null;

  return (
    <div className="merch-app">
      <header className="merch-header">
        <span className="merch-logo-text">HC-Merch</span>
      </header>

      <main className="merch-main">
        {step === 'product' && (
          <section className="merch-card">
            <p className="merch-breadcrumb">Merchandise / Caps</p>
            <h1 className="merch-title">HC-Forex Classic Cap</h1>

            <div className="merch-hero">
              <div className="merch-cap-real">
                <img src={capImg} alt="HC-Forex cap" className="merch-cap-img" />
                <div className="merch-cap-logo-center">
                  <div className="merch-cap-logo-inner">
                    <img src="/logo-qr.svg" alt="HC logo" />
                  </div>
                </div>
              </div>
            </div>

            <p className="merch-price">{formattedPrice}</p>
            <p className="merch-copy">White cotton cap with embroidered HC-Forex logo. Adjustable strap, one size fits most.</p>

            <label className="merch-input-group">
              <span className="merch-input-label">Deposit amount (IDR)</span>
              <input
                type="text"
                inputMode="numeric"
                className="merch-input"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="150000"
              />
            </label>

            {error && <p className="merch-error">{error}</p>}

            <button
              type="button"
              className="merch-button merch-button-primary"
              onClick={handleAddToCart}
              disabled={loading}
            >
              {loading ? 'Creating QR…' : 'Add to cart with QRIS'}
            </button>
          </section>
        )}

        {step === 'deposit' && (
          <section className="merch-card">
            <button
              type="button"
              className="merch-back"
              onClick={() => setStep('product')}
            >
              ← Back to cap
            </button>
            <h2 className="merch-subtitle">Scan to deposit</h2>
            {formattedPayinAmount && (
              <p className="merch-pay-amount">{formattedPayinAmount}</p>
            )}

            <div className="merch-qr-wrap">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Deposit QR" className="merch-qr-image" />
              ) : (
                <div className="merch-qr-placeholder">Loading QR</div>
              )}
            </div>

            <p className="merch-qr-hint">
              Use your Indonesian banking or e-wallet app to scan this QRIS code. Once paid, your HC-Forex balance will update for this cap purchase.
            </p>

            {payin && (
              <div className="merch-meta">
                <div className="merch-meta-row">
                  <span>Reference</span>
                  <code>{payin.uuid}</code>
                </div>
                <div className="merch-meta-row">
                  <span>Expires</span>
                  <span>{new Date(payin.expired_at).toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}


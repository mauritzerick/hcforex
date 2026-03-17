import { useState } from 'react';
import { createPayin, payinHasQr, type PayinResponse } from './api/payin';
import { qrStringToDataUrl } from './utils/qr';
import './EcommerceMobilePage.css';

const IDR_MIN_AMOUNT = 10000;

export function EcommerceMobilePage() {
  const [step, setStep] = useState<'product' | 'deposit'>('product');
  const [amount, setAmount] = useState<string>('100000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payin, setPayin] = useState<PayinResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const handleAddToCart = () => {
    setStep('deposit');
  };

  const handleAmountChange = (value: string) => {
    setAmount(value.replace(/\D/g, ''));
    setError(null);
  };

  const handleCreateDeposit = async () => {
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
  }).format(37780000);

  const formattedPayinAmount =
    payin && typeof payin.amount === 'string'
      ? new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0,
        }).format(Number(payin.amount))
      : null;

  return (
    <div className="ecom-app">
      <header className="ecom-header">
        <div className="ecom-brand">HC-Forex • Shop</div>
      </header>

      <main className="ecom-main">
        {step === 'product' && (
          <section className="ecom-card">
            <p className="ecom-breadcrumb">Home / Appliances / Fridges</p>
            <h1 className="ecom-title">Bosch Pigeon Pair GSN33VI3AKSV33VI3A</h1>

            <div className="ecom-product-hero">
              <div className="ecom-image-placeholder">
                <span className="ecom-image-label">Product image</span>
              </div>
            </div>

            <p className="ecom-price">{formattedPrice}</p>

            <div className="ecom-badges">
              <span className="ecom-badge primary">FREE DELIVERY</span>
              <span className="ecom-badge">PRICE MATCH GUARANTEE</span>
            </div>

            <button
              type="button"
              className="ecom-button primary"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            <p className="ecom-delivery-note">
              Free delivery • Next day delivery available in Jakarta &amp; surrounding areas.
            </p>
          </section>
        )}

        {step === 'deposit' && (
          <>
            <section className="ecom-card ecom-deposit-card">
              <button
                type="button"
                className="ecom-back"
                onClick={() => setStep('product')}
              >
                ← Back to product
              </button>
              <h2 className="ecom-deposit-title">Top up via IDR deposit</h2>
              <p className="ecom-deposit-copy">
                Create a QRIS deposit to fund your HC-Forex wallet, then we&apos;ll place the order.
              </p>

              <label className="ecom-input-group">
                <span className="ecom-input-label">Deposit amount (IDR)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="ecom-input"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="100000"
                />
              </label>

              {error && <p className="ecom-error">{error}</p>}

              <button
                type="button"
                className="ecom-button primary"
                onClick={handleCreateDeposit}
                disabled={loading}
              >
                {loading ? 'Creating QR…' : 'Create deposit QR'}
              </button>
            </section>

            {payin && (
              <section className="ecom-card ecom-qr-card">
                <h3 className="ecom-qr-title">Scan to deposit</h3>
                {formattedPayinAmount && (
                  <p className="ecom-qr-amount">{formattedPayinAmount}</p>
                )}

                <div className="ecom-qr-wrap">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Deposit QR code" className="ecom-qr-image" />
                  ) : (
                    <div className="ecom-qr-placeholder">Loading QR…</div>
                  )}
                </div>

                <p className="ecom-qr-hint">
                  Use your Indonesian banking or e-wallet app to scan this QRIS code. Once paid, your order will be
                  confirmed.
                </p>

                <div className="ecom-meta">
                  <div className="ecom-meta-row">
                    <span>Reference</span>
                    <code>{payin.uuid}</code>
                  </div>
                  <div className="ecom-meta-row">
                    <span>Expires</span>
                    <span>{new Date(payin.expired_at).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}


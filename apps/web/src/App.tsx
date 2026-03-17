import { useState } from 'react';
import {
  createPayin,
  type PayinResponse,
  type PayinCurrency,
  type PayinVndParams,
  type PayinKrwParams,
  payinHasQr,
} from './api/payin';
import {
  buildPayoutPayload,
  defaultPayoutForm,
  type PayoutFormData,
  type PayoutPayloadDisplay,
} from './api/payout';
import { qrStringToDataUrl } from './utils/qr';
import { CardPage } from './CardPage';
import { BalanceChart } from './BalanceChart';
import './App.css';

export type Currency = 'IDR' | 'VND' | 'KRW' | 'MYR' | 'JPY' | 'AUD' | 'INR' | 'ARS';

const CURRENCIES: Currency[] = ['IDR', 'VND', 'KRW', 'MYR', 'JPY', 'AUD', 'INR', 'ARS'];

type Step = 'currency-select' | 'dashboard' | 'amount' | 'qr' | 'withdraw' | 'withdraw-preview';
type Page = 'forex' | 'card';

const BALANCES: Record<Currency, number> = {
  IDR: 125_000_000,
  VND: 500_000_000,
  KRW: 1_000_000,
  MYR: 50_000,
  JPY: 1_500_000,
  AUD: 12_000,
  INR: 850_000,
  ARS: 1_200_000,
};

const CURRENCY_LABELS: Record<Currency, string> = {
  IDR: 'Indonesian Rupiah',
  VND: 'Vietnamese Dong',
  KRW: 'South Korean Won',
  MYR: 'Malaysian Ringgit',
  JPY: 'Japanese Yen',
  AUD: 'Australian Dollar',
  INR: 'Indian Rupee',
  ARS: 'Argentine Peso',
};

const CURRENCY_FLAGS: Record<Currency, string> = {
  IDR: 'https://flagcdn.com/w80/id.png',
  VND: 'https://flagcdn.com/w80/vn.png',
  KRW: 'https://flagcdn.com/w80/kr.png',
  MYR: 'https://flagcdn.com/w80/my.png',
  JPY: 'https://flagcdn.com/w80/jp.png',
  AUD: 'https://flagcdn.com/w80/au.png',
  INR: 'https://flagcdn.com/w80/in.png',
  ARS: 'https://flagcdn.com/w80/ar.png',
};

function formatCurrency(n: number, currency: Currency): string {
  const locale =
    currency === 'IDR' ? 'id-ID'
    : currency === 'VND' ? 'vi-VN'
    : currency === 'KRW' ? 'ko-KR'
    : currency === 'MYR' ? 'ms-MY'
    : currency === 'JPY' ? 'ja-JP'
    : currency === 'AUD' ? 'en-AU'
    : currency === 'INR' ? 'en-IN'
    : 'es-AR';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(n);
}

const DEPOSIT_CONFIG: Record<
  PayinCurrency,
  { minAmount: number; quickAmounts: number[]; placeholder: string; methodLabel: string }
> = {
  IDR: {
    minAmount: 10000,
    quickAmounts: [50000, 100000, 250000, 500000, 1000000],
    placeholder: '100000',
    methodLabel: 'QRIS • Instant',
  },
  VND: {
    minAmount: 10000,
    quickAmounts: [500000, 1000000, 2000000, 5000000, 10000000],
    placeholder: '1000000',
    methodLabel: 'VietQR • Instant',
  },
  KRW: {
    minAmount: 1000,
    quickAmounts: [10000, 15000, 30000, 50000, 100000],
    placeholder: '15000',
    methodLabel: 'Bank transfer • kr_bank_krw',
  },
};

function App() {
  const [page, setPage] = useState<Page>('forex');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [step, setStep] = useState<Step>('currency-select');
  const [amount, setAmount] = useState<string>('100000');
  const [vndPhone, setVndPhone] = useState('0123456789');
  const [vndIpAddress, setVndIpAddress] = useState('134.168.161.19');
  const [krwUserName, setKrwUserName] = useState('Jeon');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payin, setPayin] = useState<PayinResponse | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [payoutForm, setPayoutForm] = useState<PayoutFormData>(defaultPayoutForm);
  const [payoutPreview, setPayoutPreview] = useState<PayoutPayloadDisplay | null>(null);

  const handleCurrencySelect = (c: Currency) => {
    setSelectedCurrency(c);
    setStep('dashboard');
    const cfg = DEPOSIT_CONFIG[c as PayinCurrency];
    if (cfg) setAmount(cfg.placeholder);
    else setAmount('0');
  };

  const handleDepositClick = () => {
    if (selectedCurrency && selectedCurrency in DEPOSIT_CONFIG) {
      const cfg = DEPOSIT_CONFIG[selectedCurrency as PayinCurrency];
      setAmount(cfg.placeholder);
      setStep('amount');
    }
  };
  const handleWithdrawClick = () => setStep('withdraw');
  const handleBack = () => {
    setStep('dashboard');
    setError(null);
  };
  const handleBackToCurrencySelect = () => {
    setStep('currency-select');
  };
  const handleBackToAmount = () => {
    setStep('amount');
    setPayin(null);
    setQrDataUrl(null);
    setError(null);
  };
  const handleBackToWithdraw = () => {
    setStep('withdraw');
    setPayoutPreview(null);
    setError(null);
  };

  const updatePayoutForm = (updates: Partial<PayoutFormData>) => {
    setPayoutForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmitWithdraw = () => {
    const num = parseInt(payoutForm.amount.replace(/\D/g, ''), 10);
    if (!num || num < 10000) {
      setError('Minimum amount is IDR 10,000');
      return;
    }
    setError(null);
    const payload = buildPayoutPayload(payoutForm);
    setPayoutPreview(payload);
    setStep('withdraw-preview');
  };

  const depositCurrency =
    selectedCurrency && selectedCurrency in DEPOSIT_CONFIG
      ? (selectedCurrency as PayinCurrency)
      : null;
  const depositConfig = depositCurrency ? DEPOSIT_CONFIG[depositCurrency] : null;

  const handleSubmitAmount = async () => {
    if (!depositCurrency || !depositConfig) return;
    const num = parseInt(amount.replace(/\D/g, ''), 10);
    if (!num || num < depositConfig.minAmount) {
      setError(`Minimum amount is ${formatCurrency(depositConfig.minAmount, depositCurrency)}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let params: PayinVndParams | PayinKrwParams | undefined;
      if (depositCurrency === 'VND') {
        params = {
          phone: vndPhone.trim() || '0123456789',
          ip_address: vndIpAddress.trim() || '134.168.161.19',
        };
      } else if (depositCurrency === 'KRW') {
        params = { user_name: krwUserName.trim() || 'Jeon' };
      }
      const res = await createPayin(num, depositCurrency, params);
      setPayin(res);
      if (payinHasQr(res)) {
        const dataUrl = await qrStringToDataUrl(res.pay_code.qr_string);
        setQrDataUrl(dataUrl);
      } else {
        setQrDataUrl(null);
      }
      setStep('qr');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">HC-Forex</div>
        <div className="ticker-strip" aria-hidden>
          <span className="ticker-dot" />
          <span className="ticker-pairs">USD/IDR 15,892 · EUR/IDR 17,234 · GBP/IDR 20,101</span>
        </div>
        <nav className="nav">
          <button
            type="button"
            className={`nav-item ${page === 'forex' ? 'active' : ''}`}
            onClick={() => setPage('forex')}
          >
            Dashboard
          </button>
          <span className="nav-item">Deposit</span>
          <span className="nav-item">Withdraw</span>
          <button
            type="button"
            className={`nav-item ${page === 'card' ? 'active' : ''}`}
            onClick={() => setPage('card')}
          >
            Card
          </button>
        </nav>
      </header>

      <main className="main">
        {page === 'card' && <CardPage />}

        {page === 'forex' && step === 'currency-select' && (
          <section className="currency-select">
            <h1 className="currency-select-title">Select currency</h1>
            <p className="currency-select-subtitle">Choose a currency to view balance and actions</p>
            <div className="currency-flag-grid">
              {CURRENCIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="currency-flag-card"
                  onClick={() => handleCurrencySelect(c)}
                  title={CURRENCY_LABELS[c]}
                  aria-label={`Select ${CURRENCY_LABELS[c]}`}
                >
                  <span className="currency-flag-wrap">
                    <img
                      src={CURRENCY_FLAGS[c]}
                      alt=""
                      className="currency-flag-img"
                      width={40}
                      height={40}
                    />
                  </span>
                  <span className="currency-flag-label">{CURRENCY_LABELS[c]}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {page === 'forex' && step === 'dashboard' && selectedCurrency && (
          <section className="dashboard">
            <button
              type="button"
              className="back"
              onClick={handleBackToCurrencySelect}
              aria-label="Back to currency select"
            >
              ← Back
            </button>
            <div className="balance-card">
              <p className="balance-label">Available balance</p>
              <div className="currency-tabs">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`currency-tab ${selectedCurrency === c ? 'active' : ''}`}
                    onClick={() => setSelectedCurrency(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="balance-value">
                {formatCurrency(BALANCES[selectedCurrency], selectedCurrency)}
              </p>
              <p className="balance-currency">{selectedCurrency}</p>
            </div>
            <div className="balance-chart-card">
              <BalanceChart currency={selectedCurrency} balance={BALANCES[selectedCurrency]} />
            </div>
            <div className="actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleDepositClick}
                disabled={!depositConfig}
              >
                Deposit
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleWithdrawClick}
              >
                Withdraw
              </button>
            </div>
            {!depositConfig && selectedCurrency && (
              <p className="coming-soon">Deposit for {selectedCurrency} coming soon</p>
            )}
          </section>
        )}

        {page === 'forex' && step === 'amount' && selectedCurrency && depositConfig && (
          <section className="deposit-flow">
            <button type="button" className="back" onClick={handleBack} aria-label="Back">
              ← Back
            </button>
            <div className="flow-card">
              <h1>Deposit {selectedCurrency}</h1>
              <p className="subtitle">{depositConfig.methodLabel}</p>
              <label className="input-group">
                <span className="input-label">Amount ({selectedCurrency})</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder={depositConfig.placeholder}
                  className="input"
                />
              </label>
              <div className="quick-amounts">
                {depositConfig.quickAmounts.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="chip"
                    onClick={() => setAmount(String(n))}
                  >
                    {formatCurrency(n, selectedCurrency)}
                  </button>
                ))}
              </div>
              {selectedCurrency === 'VND' && (
                <>
                  <label className="input-group">
                    <span className="input-label">Phone</span>
                    <input
                      type="text"
                      value={vndPhone}
                      onChange={(e) => setVndPhone(e.target.value)}
                      className="input"
                      placeholder="0123456789"
                    />
                  </label>
                  <label className="input-group">
                    <span className="input-label">IP address</span>
                    <input
                      type="text"
                      value={vndIpAddress}
                      onChange={(e) => setVndIpAddress(e.target.value)}
                      className="input"
                      placeholder="134.168.161.19"
                    />
                  </label>
                </>
              )}
              {selectedCurrency === 'KRW' && (
                <label className="input-group">
                  <span className="input-label">User name (remitter)</span>
                  <input
                    type="text"
                    value={krwUserName}
                    onChange={(e) => setKrwUserName(e.target.value)}
                    className="input"
                    placeholder="Jeon"
                  />
                </label>
              )}
              {error && <p className="error">{error}</p>}
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleSubmitAmount}
                disabled={loading}
              >
                {loading ? 'Creating…' : 'Continue'}
              </button>
            </div>
          </section>
        )}

        {page === 'forex' && step === 'qr' && payin && selectedCurrency && (
          <section className="deposit-flow qr-step">
            <button type="button" className="back" onClick={handleBackToAmount} aria-label="Back">
              ← Back
            </button>
            <div className="flow-card qr-card">
              {payinHasQr(payin) ? (
                <>
                  <h1>Scan to pay</h1>
                  <p className="subtitle">
                    Pay {formatCurrency(Number(payin.amount), selectedCurrency)} with{' '}
                    {payin.currency === 'VND' ? 'VietQR' : 'QRIS'}
                  </p>
                  <div className="qr-wrap">
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR Code" className="qr-image" />
                    ) : (
                      <div className="qr-placeholder">Loading QR…</div>
                    )}
                  </div>
                  <p className="qr-hint">
                    Open your banking or e-wallet app and scan this QR code
                  </p>
                </>
              ) : (
                <>
                  <h1>Bank transfer details</h1>
                  <p className="subtitle">
                    Pay {formatCurrency(Number(payin.amount), selectedCurrency)} via bank transfer
                  </p>
                  <div className="bank-details">
                    {Object.entries(payin.pay_code)
                      .filter(([key, value]) => key !== 'qr_string' && value != null && value !== '')
                      .map(([key, value]) => (
                        <div key={key} className="bank-detail-row">
                          <span className="bank-detail-label">
                            {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                          </span>
                          <span className="bank-detail-value">
                            {typeof value === 'object'
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                  </div>
                  <p className="qr-hint">
                    Transfer the exact amount to the account above. Use the reference if required.
                  </p>
                </>
              )}
              <div className="payin-meta">
                <div className="meta-row">
                  <span>Reference</span>
                  <code>{payin.uuid}</code>
                </div>
                <div className="meta-row">
                  <span>Amount</span>
                  <span>{formatCurrency(Number(payin.amount), selectedCurrency)}</span>
                </div>
                <div className="meta-row">
                  <span>Expires</span>
                  <span>{new Date(payin.expired_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {page === 'forex' && step === 'withdraw' && (
          <section className="deposit-flow withdraw-flow">
            <button type="button" className="back" onClick={handleBack} aria-label="Back">
              ← Back
            </button>
            <div className="flow-card">
              <h1>Withdraw IDR</h1>
              <p className="subtitle">Bank transfer • id_bank_idr</p>
              <label className="input-group">
                <span className="input-label">Amount (IDR)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={payoutForm.amount}
                  onChange={(e) => updatePayoutForm({ amount: e.target.value.replace(/\D/g, '') })}
                  placeholder="100000"
                  className="input"
                />
              </label>
              <div className="form-row">
                <label className="input-group">
                  <span className="input-label">First name</span>
                  <input
                    type="text"
                    value={payoutForm.first_name}
                    onChange={(e) => updatePayoutForm({ first_name: e.target.value })}
                    className="input"
                    placeholder="Clever"
                  />
                </label>
                <label className="input-group">
                  <span className="input-label">Last name</span>
                  <input
                    type="text"
                    value={payoutForm.last_name}
                    onChange={(e) => updatePayoutForm({ last_name: e.target.value })}
                    className="input"
                    placeholder="Hello"
                  />
                </label>
              </div>
              <label className="input-group">
                <span className="input-label">Email</span>
                <input
                  type="email"
                  value={payoutForm.email}
                  onChange={(e) => updatePayoutForm({ email: e.target.value })}
                  className="input"
                  placeholder="test@example.com"
                />
              </label>
              <hr className="form-divider" />
              <p className="input-label">Bank details</p>
              <label className="input-group">
                <span className="input-label">Bank code</span>
                <input
                  type="text"
                  value={payoutForm.bank_code}
                  onChange={(e) => updatePayoutForm({ bank_code: e.target.value })}
                  className="input"
                  placeholder="BMRIIDJA"
                />
              </label>
              <label className="input-group">
                <span className="input-label">Account number</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={payoutForm.account_number}
                  onChange={(e) => updatePayoutForm({ account_number: e.target.value })}
                  className="input"
                  placeholder="0036003503467"
                />
              </label>
              <label className="input-group">
                <span className="input-label">Account name</span>
                <input
                  type="text"
                  value={payoutForm.account_name}
                  onChange={(e) => updatePayoutForm({ account_name: e.target.value })}
                  className="input"
                  placeholder="Deeles"
                />
              </label>
              <label className="input-group">
                <span className="input-label">Description</span>
                <input
                  type="text"
                  value={payoutForm.description}
                  onChange={(e) => updatePayoutForm({ description: e.target.value })}
                  className="input"
                  placeholder="Test payout"
                />
              </label>
              <label className="input-group">
                <span className="input-label">External ID</span>
                <input
                  type="text"
                  value={payoutForm.external_id}
                  onChange={(e) => updatePayoutForm({ external_id: e.target.value })}
                  className="input"
                  placeholder="123"
                />
              </label>
              {error && <p className="error">{error}</p>}
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={handleSubmitWithdraw}
              >
                Preview payload (no POST)
              </button>
            </div>
          </section>
        )}

        {page === 'forex' && step === 'withdraw-preview' && payoutPreview && (
          <section className="deposit-flow withdraw-preview">
            <button type="button" className="back" onClick={handleBackToWithdraw} aria-label="Back">
              ← Back
            </button>
            <div className="flow-card payload-card">
              <h1>Payout payload (mock)</h1>
              <p className="subtitle">This is what would be sent to the API. No request is made.</p>
              <div className="payload-block">
                <div className="payload-meta">
                  <span className="payload-method">{payoutPreview.method}</span>
                  <span className="payload-endpoint">{payoutPreview.endpoint}</span>
                </div>
                <div className="payload-section">
                  <span className="payload-label">Headers</span>
                  <pre className="payload-json">
                    {JSON.stringify(payoutPreview.headers, null, 2)}
                  </pre>
                </div>
                <div className="payload-section">
                  <span className="payload-label">Body</span>
                  <pre className="payload-json">
                    {JSON.stringify(payoutPreview.body, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;

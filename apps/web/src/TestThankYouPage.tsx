import { useState } from 'react';
import './App.css';

type TestCurrency = 'IDR' | 'VND';

export function TestThankYouPage() {
  const [currency, setCurrency] = useState<TestCurrency>('IDR');

  return (
    <div className="app">
      <header className="header">
        <div className="logo">HC-Forex</div>
      </header>
      <main className="main">
        <section className="deposit-flow qr-step">
          <div className="flow-card qr-card">
            <div
              className={`thank-you-burst ${currency === 'VND' ? 'vnd' : ''}`}
              aria-hidden
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <span key={i} className="thank-you-piece" />
              ))}
            </div>
            <h1>Payment received</h1>
            <p className="subtitle">Animation preview mode (no real payment)</p>
            <div className="actions" style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className={`btn ${currency === 'IDR' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrency('IDR')}
              >
                IDR Theme
              </button>
              <button
                type="button"
                className={`btn ${currency === 'VND' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrency('VND')}
              >
                VND Theme
              </button>
            </div>
            <p className="qr-hint">
              Open <code>/test</code> to preview this page anytime.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import './CardPage.css';

const DEFAULT_SDK_URL =
  'https://cdn.lightningpay.me/media/getkollo-sdk/1.1.0/sandbox/getkollo.js';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false; // run immediately after load so window.GetKollo is set before onload
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

/** Poll for window.GetKollo in case the SDK attaches it after a short delay */
function waitForGetKollo(timeoutMs = 3000, intervalMs = 50): Promise<boolean> {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      if (typeof window !== 'undefined' && window.GetKollo) {
        resolve(true);
        return;
      }
      if (Date.now() >= deadline) {
        resolve(false);
        return;
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

export type CardPageForm = {
  external_id: string;
  customer_name: string;
  customer_email: string;
  amount_cents: string;
  currency: 'USD' | 'AUD';
  return_url: string;
};

const defaultForm: CardPageForm = {
  external_id: `order-${Date.now()}`,
  customer_name: 'John Doe',
  customer_email: 'john_doe@gmail.com',
  amount_cents: '1000',
  currency: 'USD',
  return_url: typeof window !== 'undefined' ? `${window.location.origin}/card` : '',
};

export function CardPage() {
  const [form, setForm] = useState<CardPageForm>(defaultForm);
  const [demoMode, setDemoMode] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [callbackMessage, setCallbackMessage] = useState<string | null>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  const appId = import.meta.env.VITE_GETKOLLO_APP_ID as string | undefined;
  const sdkUrl =
    (import.meta.env.VITE_GETKOLLO_SDK_URL as string | undefined) || DEFAULT_SDK_URL;

  useEffect(() => {
    let cancelled = false;
    setSdkError(null);
    loadScript(sdkUrl)
      .then(async () => {
        if (cancelled) return;
        const found = await waitForGetKollo();
        if (cancelled) return;
        if (found) {
          setSdkLoaded(true);
        } else {
          setSdkError(
            'GetKollo SDK did not attach to window. Check the browser console for script errors (e.g. CSP or blocked requests).'
          );
        }
      })
      .catch((err) => {
        if (!cancelled) setSdkError(err instanceof Error ? err.message : 'Failed to load SDK');
      });
    return () => {
      cancelled = true;
    };
  }, [sdkUrl]);

  const updateForm = (updates: Partial<CardPageForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
    setCreateError(null);
    setCallbackMessage(null);
  };

  const handleCreatePayment = async () => {
    if (demoMode) {
      setCreating(true);
      setCreateError(null);
      setCallbackMessage(null);
      await new Promise((r) => setTimeout(r, 800));
      setCallbackMessage('Demo: payment succeeded (no real charge). Use an authorized domain for the real SDK.');
      setCreating(false);
      return;
    }

    if (!appId?.trim()) {
      setCreateError('VITE_GETKOLLO_APP_ID is not set. Add it to .env and restart the dev server.');
      return;
    }
    if (!window.GetKollo) {
      setCreateError('GetKollo SDK not loaded yet.');
      return;
    }
    const amount = parseInt(form.amount_cents.replace(/\D/g, ''), 10);
    if (!amount || amount < 1) {
      setCreateError('Amount must be at least 1 cent.');
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCallbackMessage(null);

    try {
      const getKolloSDK = new window.GetKollo({ app_id: appId });
      const init = await getKolloSDK.initialize();
      if (!init?.success) {
        setCreateError(init?.error ?? 'SDK initialize failed');
        return;
      }

      const order: GetKolloOrder = {
        external_id: form.external_id.trim() || `order-${Date.now()}`,
        customer_name: form.customer_name.trim() || undefined,
        customer_email: form.customer_email.trim() || undefined,
        amount,
        currency: form.currency,
        return_url: form.return_url.trim() || undefined,
      };

      const options: GetKolloOptions = {
        mountElement: '.get-kollo',
        styleProps: {
          frame: { width: '100%', height: '100%' },
        },
        events: {
          onReady: () => setCallbackMessage('Form ready for input'),
          onLoading: (isLoading) => setCallbackMessage(isLoading ? 'Loading…' : null),
        },
      };

      window.getkolloCardCallback = (message: GetKolloCallbackResponse) => {
        if (message?.status !== 'succeeded') {
          const err = message?.error;
          const msg = err?.code === 'card_init_timeout'
            ? 'Card form failed to render in time.'
            : (err?.message ?? 'Payment failed');
          setCreateError(msg);
        } else {
          setCallbackMessage('Payment succeeded');
        }
      };

      const resp = await getKolloSDK.createPayment(order, options);
      if (!resp?.success) {
        setCreateError(resp?.error ?? 'Create payment failed');
      }
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Create payment failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="card-page">
      <div className="card-page-inner">
        <h1 className="card-page-title">Embedded card form</h1>
        <p className="card-page-subtitle">
          GetKollo SDK • Supported currencies: AUD &amp; USD
        </p>
        <p className="card-page-hint">
          To test locally: (1) <strong>Ask Hello Clever to whitelist localhost</strong> (or localhost:5173) for your app_id so you can use http://localhost:5173. (2) Or use a <strong>tunnel</strong> (e.g. Cloudflare Tunnel) with a subdomain like dev.digital-core.us and ask them to allow it. See <code>apps/web/LOCAL-DOMAIN.md</code>. Enable <strong>Demo mode</strong> below to try the UI without the real SDK when you get &quot;Not Authorize&quot;.
        </p>

        {!sdkLoaded && !sdkError && (
          <p className="card-page-status">Loading SDK…</p>
        )}
        {sdkError && (
          <p className="card-page-error">{sdkError}</p>
        )}

        <div className="flow-card card-form-card">
          <label className="card-page-demo-toggle">
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
            />
            <span>Demo mode</span> — use without real SDK (for local UI testing when you get &quot;Not Authorize&quot;)
          </label>
          <div className="input-group">
            <span className="input-label">External ID</span>
            <input
              type="text"
              value={form.external_id}
              onChange={(e) => updateForm({ external_id: e.target.value })}
              className="input"
              placeholder="order-001"
            />
          </div>
          <div className="form-row">
            <label className="input-group">
              <span className="input-label">Customer name</span>
              <input
                type="text"
                value={form.customer_name}
                onChange={(e) => updateForm({ customer_name: e.target.value })}
                className="input"
                placeholder="John Doe"
              />
            </label>
            <label className="input-group">
              <span className="input-label">Customer email</span>
              <input
                type="email"
                value={form.customer_email}
                onChange={(e) => updateForm({ customer_email: e.target.value })}
                className="input"
                placeholder="john@example.com"
              />
            </label>
          </div>
          <div className="form-row">
            <label className="input-group">
              <span className="input-label">Amount (cents)</span>
              <input
                type="text"
                inputMode="numeric"
                value={form.amount_cents}
                onChange={(e) =>
                  updateForm({ amount_cents: e.target.value.replace(/\D/g, '') })
                }
                className="input"
                placeholder="1000"
              />
            </label>
            <label className="input-group">
              <span className="input-label">Currency</span>
              <select
                value={form.currency}
                onChange={(e) =>
                  updateForm({ currency: e.target.value as 'USD' | 'AUD' })
                }
                className="input"
              >
                <option value="USD">USD</option>
                <option value="AUD">AUD</option>
              </select>
            </label>
          </div>
          <div className="input-group">
            <span className="input-label">Return URL (optional)</span>
            <input
              type="url"
              value={form.return_url}
              onChange={(e) => updateForm({ return_url: e.target.value })}
              className="input"
              placeholder="https://yourdomain.com/success"
            />
          </div>

          {createError && <p className="error">{createError}</p>}
          {callbackMessage && (
            <p className="card-page-callback">{callbackMessage}</p>
          )}

          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={handleCreatePayment}
            disabled={creating || (!demoMode && !sdkLoaded)}
          >
            {creating ? 'Initializing…' : demoMode ? 'Simulate payment (demo)' : 'Initialize SDK & create payment'}
          </button>
        </div>

        <div className="get-kollo-wrap" ref={mountRef}>
          <p className="get-kollo-label">Card iframe mount</p>
          {demoMode ? (
            <div className="get-kollo get-kollo-demo">
              Demo mode — card iframe would appear here when the domain is authorized (e.g. digital-core.us or whitelisted localhost).
            </div>
          ) : (
            <div className="get-kollo" />
          )}
        </div>
      </div>
    </section>
  );
}

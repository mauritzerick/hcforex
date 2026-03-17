# Running as digital-core.us locally (GetKollo / Hello Clever)

The GetKollo API only authorizes requests from your **registered domain** (e.g. `https://digital-core.us`). You cannot change the domain the SDK sends (it uses `window.location.host`). Here are ways to test locally:

## Ways to test locally

1. **Ask Hello Clever to whitelist localhost** (easiest)  
   Request that they add **localhost** or **localhost:5173** (and optionally **127.0.0.1**) to the allowed domains for your app_id. Then run `npm run dev`, open **http://localhost:5173**, and the real SDK will work without any domain tricks.

2. **Demo mode on the Card page**  
   On the Card page, turn on **Demo mode**. You can fill the form and click “Simulate payment (demo)” to see the flow without calling the real SDK. Use this for UI work when you get “Not Authorize”.

3. **Tunnel with a subdomain**  
   Run your app locally, then expose it with [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps) or [ngrok](https://ngrok.com/) using a subdomain you control (e.g. **dev.digital-core.us**). Open the tunnel’s HTTPS URL in the browser. Ask Hello Clever to allow that subdomain for your app_id.

4. **Hosts file + HTTPS** (only if your browser accepts Vite’s cert)  
   If you previously got **ERR_SSL_VERSION_OR_CIPHER_MISMATCH**, this may not work. If it does: add `127.0.0.1 digital-core.us` to your hosts file, run `npm run dev --workspace=@idr-brick/web -- --https`, then open **https://digital-core.us:5173** and accept the self-signed certificate.

---

## Steps (for hosts + HTTPS or tunnel)

1. **Map the domain to localhost**  
   Edit your hosts file and add:

   ```text
   127.0.0.1 digital-core.us
   ```

   - **macOS / Linux:** `sudo nano /etc/hosts`  
   - **Windows:** Run Notepad as Administrator, open `C:\Windows\System32\drivers\etc\hosts`

2. **Start the dev server**  
   From repo root:

   ```bash
   npm run dev
   ```

   The web app runs on **HTTP** by default. Open **http://localhost:5173** (or the port Vite prints). If you see ERR_SSL_VERSION_OR_CIPHER_MISMATCH when using HTTPS, use Option B (tunnel) below.

3. **Open the app**  
   Go to **http://localhost:5173** in your browser (or 5174 if that is the port Vite shows).

4. **Accept the self-signed certificate**  
   The browser will warn about the certificate. Proceed (e.g. “Advanced” → “Proceed to digital-core.us”).

After that, `window.location.host` is `digital-core.us:5173`. If Hello Clever validates only the hostname `digital-core.us`, requests should be accepted. If they require an exact origin (including port), ask them to allow `digital-core.us:5173` for development.

## Optional: use port 443 (when using HTTPS)

If the API only allows `digital-core.us` with no port (i.e. port 443), you can run Vite on 443 (requires admin once):

```bash
npm run dev --workspace=@idr-brick/web -- --port 443 --https
```

Then open `https://digital-core.us`. On Linux/macOS you may need `sudo` for port 443.

## Option B: Tunnel (if you get ERR_SSL_VERSION_OR_CIPHER_MISMATCH)

Use **ngrok** or **Cloudflare Tunnel** to expose your local app over HTTPS with a valid certificate. Run `npm run dev`, then e.g. `ngrok http 5173`, and open the https URL ngrok gives you. If you can use a custom domain (e.g. digital-core.us) in the tunnel, GetKollo will accept it.

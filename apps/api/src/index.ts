import express from 'express';
import { createPayin, getPayinDetail } from './routes/payins.js';
import { getConfig } from './config.js';

const app = express();

app.use(express.json());

const config = getConfig();
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
  'https://localhost:5173',
  'https://localhost:5174',
  'https://localhost:5175',
  'https://127.0.0.1:5173',
  'https://127.0.0.1:5174',
  'https://127.0.0.1:5175',
  'https://digital-core.us:5173',
  'https://digital-core.us:5174',
  'https://digital-core.us:5175',
  ...config.allowedOrigins,
];
const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const vercelOrigin = /^https:\/\/[a-z0-9-]+\.vercel\.app$/;
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (
    origin &&
    (allowedOrigins.includes(origin) ||
      localhostOrigin.test(origin) ||
      vercelOrigin.test(origin))
  ) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.post('/api/payins', createPayin);
app.get('/api/payins/detail', getPayinDetail);

// So opening http://localhost:3001 in the browser doesn't show 404
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'idr-brick API',
    endpoints: { 'POST /api/payins': 'Create payin' },
    webApp: 'Use https://localhost:5173 or https://localhost:5174 for the app UI',
  });
});

app.get('/api', (req, res) => {
  res.json({ ok: true, endpoints: ['POST /api/payins'] });
});

const { port } = config;
app.listen(port, '0.0.0.0', () => {
  console.log(`API listening on http://localhost:${port}`);
});

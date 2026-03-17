import QRCode from 'qrcode';

const QR_SIZE = 280;
const LOGO_SIZE = 56;
const LOGO_PADDING = 10;
const LOGO_BG_SIZE = LOGO_SIZE + LOGO_PADDING * 2;
const LOGO_URL = '/logo-qr.svg';
const FLAG_OVERLAY_URL = '/flag-id.svg';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

async function drawBaseQr(qrString: string): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');

  await QRCode.toCanvas(canvas, qrString, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: QR_SIZE,
    color: { dark: '#0f172a', light: '#ffffff' },
  });

  return canvas;
}

export async function qrStringToDataUrl(qrString: string): Promise<string> {
  const canvas = await drawBaseQr(qrString);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const center = QR_SIZE / 2;

  // White circle behind logo so the QR stays readable
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(center, center, LOGO_BG_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  const img = await loadImage(LOGO_URL);
  ctx.drawImage(
    img,
    center - LOGO_SIZE / 2,
    center - LOGO_SIZE / 2,
    LOGO_SIZE,
    LOGO_SIZE
  );

  return canvas.toDataURL('image/png');
}

export async function qrStringToDataUrlWithOverlay(qrString: string, overlaySrc: string): Promise<string> {
  const canvas = await drawBaseQr(qrString);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  const center = QR_SIZE / 2;
  const overlaySize = QR_SIZE * 0.26; // ~25–30% of QR width
  const radius = overlaySize / 2;

  const img = await loadImage(overlaySrc);
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(
    center - radius,
    center - radius,
    overlaySize,
    overlaySize,
    overlaySize * 0.2
  );
  ctx.clip();
  ctx.drawImage(
    img,
    center - radius,
    center - radius,
    overlaySize,
    overlaySize
  );
  ctx.restore();

  return canvas.toDataURL('image/png');
}

export async function qrStringToDataUrlWithFlag(qrString: string): Promise<string> {
  return qrStringToDataUrlWithOverlay(qrString, FLAG_OVERLAY_URL);
}


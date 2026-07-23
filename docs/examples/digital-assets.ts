/**
 * Digital product deliverables — pre-purchase list and post-purchase downloads.
 */
import { shopApi, type TokenStore } from './client-setup';

async function loadProductDeliverables(productId: number | string, sessionId: string) {
  const res = await shopApi(`/products/${productId}/digital-assets/`, { sessionId });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`digital-assets failed: ${res.status}`);
  return res.json();
}

async function loadOrderDownloads(orderId: number, sessionId: string, tokens: TokenStore) {
  const res = await shopApi(`/orders/${orderId}/assets/`, { sessionId, tokens });
  if (!res.ok) throw new Error(`order assets failed: ${res.status}`);
  return res.json() as Promise<{
    order_id: number;
    assets: Array<{
      id: number;
      title: string;
      download_url?: string;
      download_expires_at?: string;
    }>;
  }>;
}

function isDownloadExpired(expiresAt?: string): boolean {
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() - 30_000 < Date.now();
}

async function refreshDownloadUrl(assetId: number, tokens: TokenStore) {
  const res = await fetch(
    `${process.env.API_BASE ?? 'https://api.fikashop.app'}/shop/api/digital-assets/assets/${assetId}/download/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.getAccessToken()}`,
        Accept: 'application/json',
      },
    },
  );
  if (!res.ok) throw new Error(`refresh download failed: ${res.status}`);
  return res.json() as Promise<{ download_url: string; download_expires_at: string }>;
}

export {
  isDownloadExpired,
  loadOrderDownloads,
  loadProductDeliverables,
  refreshDownloadUrl,
};

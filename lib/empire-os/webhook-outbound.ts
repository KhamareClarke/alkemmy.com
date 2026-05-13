import 'server-only';

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const MAX_ATTEMPTS = 4;
const BASE_MS = 500;

export type WebhookDeliveryResult = { url: string; ok: boolean; status?: number; error?: string };

export async function deliverJsonWebhook(
  url: string,
  body: unknown,
  extraHeaders: Record<string, string> = {}
): Promise<WebhookDeliveryResult> {
  let lastErr: string | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...extraHeaders },
        body: JSON.stringify(body),
      });
      if (res.ok) return { url, ok: true, status: res.status };
      lastErr = `HTTP ${res.status}`;
    } catch (e) {
      lastErr = e instanceof Error ? e.message : String(e);
    }
    if (attempt < MAX_ATTEMPTS) await sleep(BASE_MS * 2 ** (attempt - 1));
  }
  return { url, ok: false, error: lastErr };
}

export async function deliverToAllUrls(
  urls: string[],
  body: unknown,
  extraHeaders?: Record<string, string>
): Promise<WebhookDeliveryResult[]> {
  const results: WebhookDeliveryResult[] = [];
  for (const url of urls) {
    results.push(await deliverJsonWebhook(url, body, extraHeaders || {}));
  }
  return results;
}

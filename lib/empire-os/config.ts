import 'server-only';

function parseOutboundUrls(): string[] {
  const raw = process.env.EMPIRE_OS_OUTBOUND_WEBHOOKS?.trim();
  if (!raw) return [];
  if (raw.startsWith('[')) {
    try {
      const j = JSON.parse(raw) as unknown;
      if (Array.isArray(j)) return j.filter((u) => typeof u === 'string') as string[];
    } catch {
      return [];
    }
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getEmpireOutboundWebhookUrls(): string[] {
  const urls = parseOutboundUrls();
  const single = process.env.EMPIRE_OS_WEBHOOK_URL?.trim();
  if (single) urls.push(single);
  return Array.from(new Set(urls));
}

export function getEmpireInboundSecret(): string | undefined {
  return process.env.EMPIRE_OS_INBOUND_SECRET?.trim();
}

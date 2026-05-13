import { getSiteUrl } from './smtp';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function shellHtml(title: string, innerHtml: string, preheader?: string): string {
  const ph = preheader ? esc(preheader) : esc(title);
  const base = getSiteUrl();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)}</title></head>
<body style="margin:0;font-family:Georgia,serif;background:#f4f4f4;color:#222;">
<div style="display:none;max-height:0;overflow:hidden;">${ph}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
<tr><td style="background:linear-gradient(135deg,#D4AF37,#B8941F);padding:24px;text-align:center;color:#111;font-size:22px;font-weight:bold;">Alkhemmy</td></tr>
<tr><td style="padding:28px 24px;line-height:1.6;font-size:15px;">${innerHtml}</td></tr>
<tr><td style="padding:16px 24px;background:#fafafa;font-size:12px;color:#666;text-align:center;">
<a href="${esc(base)}" style="color:#B8941F;">Visit store</a> · © ${new Date().getFullYear()} Alkhemmy
</td></tr></table></td></tr></table></body></html>`;
}

export function shellText(title: string, innerText: string): string {
  return `${title} — Alkhemmy\n\n${innerText}\n\n${getSiteUrl()}`;
}

export { esc };

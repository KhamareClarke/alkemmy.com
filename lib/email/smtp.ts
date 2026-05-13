import nodemailer from 'nodemailer';

export function getSmtpUser(): string {
  const u = process.env.SMTP_USER || process.env.GMAIL_USER;
  if (!u) {
    throw new Error('Missing SMTP_USER or GMAIL_USER in environment');
  }
  return u;
}

export function getSmtpPass(): string {
  const p = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  if (!p) {
    throw new Error('Missing SMTP_PASS or GMAIL_APP_PASSWORD in environment');
  }
  return p.replace(/\s+/g, '');
}

export function getFromEmail(): string {
  return process.env.EMAIL_FROM || getSmtpUser();
}

export function getAdminEmail(): string {
  return process.env.EMAIL_ADMIN || getSmtpUser();
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000'
  ).replace(/\/$/, '');
}

export function createEmailTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: getSmtpUser(),
      pass: getSmtpPass(),
    },
  });
}

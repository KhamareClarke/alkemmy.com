/**
 * One-off / manual SMTP test. Loads .env.local from repo root.
 * Usage: node scripts/send-test-email.mjs
 */
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const user = process.env.SMTP_USER || process.env.GMAIL_USER;
const passRaw = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
const pass = passRaw ? String(passRaw).replace(/\s+/g, '') : '';
const from = process.env.EMAIL_FROM || user;

const recipients = ['fizasaif0233@gmail.com', 'khamareclarke@gmail.com'];

if (!user || !pass) {
  console.error('Missing SMTP_USER/GMAIL_USER or SMTP_PASS/GMAIL_APP_PASSWORD in .env.local');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass },
});

const when = new Date().toISOString();

for (const to of recipients) {
  await transporter.sendMail({
    from,
    to,
    subject: 'Alkhemmy SMTP test',
    text: `Test email (${when}). Outbound mail from the app is working.`,
    html: `<p>Test email (<code>${when}</code>).</p><p>Outbound mail from the app is working.</p>`,
  });
  console.log('Sent:', to);
}

console.log('Done.');

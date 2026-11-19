/**
 * Real vaqtdagi monitoring va imzolangan webhooklar.
 *
 * createPatientMonitor() — har bir yangi o'lchovni "ingest" qiladi va hodisalar chiqaradi:
 *   'reading'          — har bir yaroqli o'lchov
 *   'critical'         — shifokorga shoshilinch signal kerak (evaluateDoctorAlert)
 *   'profile-required' — sutkalik glikemik profil kerak
 *   'invalid'          — o'lchov yaroqsiz
 * Shifoxona tizimi bu hodisalarni SMS, Telegram, e-mail yoki webhookga ulaydi.
 */

const { EventEmitter } = require('events');
const crypto = require('crypto');
const { evaluateDoctorAlert } = require('../doctorAlert');
const { needsGlycemicProfile } = require('../glycemicProfile');
const { validateRecord } = require('../validation');

/**
 * @param {{ lang?: 'uz'|'ru'|'en', webhookUrl?: string, webhookSecret?: string, fetch?: Function }} [options]
 */
function createPatientMonitor(options = {}) {
  const emitter = new EventEmitter();
  const lang = options.lang || 'uz';

  emitter.ingest = (reading, patient = {}) => {
    const v = validateRecord(reading, { lang });
    if (!v.valid) {
      emitter.emit('invalid', { reading, errors: v.errors, patient });
      return { accepted: false, errors: v.errors };
    }
    const patientName = [patient.firstName, patient.lastName].filter(Boolean).join(' ') || patient.name || 'Bemor';
    const alert = evaluateDoctorAlert({ ...v.normalized, patientName, lang });
    const profile = needsGlycemicProfile({ ...v.normalized, lang });
    const event = { reading: v.normalized, patient, alert, glycemicProfile: profile, at: new Date().toISOString() };

    emitter.emit('reading', event);
    if (alert.shouldAlert) {
      emitter.emit('critical', event);
      if (options.webhookUrl) {
        sendWebhook(options.webhookUrl, { type: 'glucose.critical', ...event }, { secret: options.webhookSecret, fetch: options.fetch })
          .catch((e) => emitter.emit('error-webhook', e));
      }
    }
    if (profile.required) emitter.emit('profile-required', event);
    return { accepted: true, alert, glycemicProfile: profile };
  };
  return emitter;
}

/** HMAC-SHA256 imzo: `sha256=<hex>` (GitHub/Stripe uslubi). */
function signPayload(payload, secret) {
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return 'sha256=' + crypto.createHmac('sha256', String(secret)).update(body).digest('hex');
}

/** Qabul qiluvchi tomonda imzoni tekshirish (timing-safe). */
function verifyWebhookSignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = Buffer.from(signPayload(rawBody, secret));
  const given = Buffer.from(String(signature));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

/**
 * Webhook yuborish (Node 18+ global fetch yoki options.fetch).
 * Sarlavhalar: X-Diabets-Event, X-Diabets-Signature (secret berilsa).
 */
async function sendWebhook(url, payload, { secret, fetch: fetchImpl, timeoutMs = 8000 } = {}) {
  const f = fetchImpl || (typeof fetch === 'function' ? fetch : null);
  if (!f) throw new Error('fetch topilmadi: Node 18+ yoki options.fetch kerak');
  const body = JSON.stringify(payload);
  const headers = { 'Content-Type': 'application/json', 'X-Diabets-Event': payload.type || 'event' };
  if (secret) headers['X-Diabets-Signature'] = signPayload(body, secret);
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
  try {
    const res = await f(url, { method: 'POST', headers, body, signal: ctrl ? ctrl.signal : undefined });
    return { ok: res.ok, status: res.status };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

module.exports = { createPatientMonitor, signPayload, verifyWebhookSignature, sendWebhook };

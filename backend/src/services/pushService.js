const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

const publicKey = process.env.VAPID_PUBLIC_KEY || 'BPYnpnvF7P6st1bZn1ZPUqvcTOeUp3vOy5TfMX7uTDlZJsP7gPPJieALdC1vPToABLggu2_cfktJcy1kvVW5WHM';
const privateKey = process.env.VAPID_PRIVATE_KEY || 'R6vHhXT2gbRSm52Dr0JoCTviXYvX8_EzpOuQp0G-l74';
const mailto = process.env.VAPID_MAILTO || 'mailto:admin@qandli-diabet.uz';

webpush.setVapidDetails(mailto, publicKey, privateKey);

/**
 * Send push notification to a user's all active devices
 * @param {string|ObjectId} userId
 * @param {object} payload - { title, body, icon, url, data }
 */
async function sendPushToUser(userId, payload) {
  try {
    const subscriptions = await PushSubscription.find({ user: userId });
    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const stringPayload = JSON.stringify({
      title: payload.title || 'Qand Nazorati',
      body: payload.body || payload.message || '',
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/icon-192x192.png',
      url: payload.url || '/',
      tag: payload.tag || 'diabetes-alert',
      data: payload.data || {},
    });

    let sent = 0;
    let failed = 0;

    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        }, stringPayload);
        sent++;
      } catch (err) {
        failed++;
        // If subscription is expired or invalid (404/410), delete it
        if (err.statusCode === 404 || err.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
        }
      }
    });

    await Promise.all(promises);
    return { sent, failed };
  } catch (err) {
    console.error('sendPushToUser error:', err);
    return { sent: 0, failed: 0, error: err.message };
  }
}

module.exports = {
  publicKey,
  sendPushToUser,
};


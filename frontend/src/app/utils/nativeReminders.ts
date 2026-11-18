import { Capacitor } from '@capacitor/core';
import { isNativeApp } from './platform';

/**
 * Phone notifications for medication/insulin reminders (Android app only).
 *
 * Each active reminder is scheduled on the device as a daily notification at
 * its HH:MM time, so it fires even when the app is closed or offline.
 * The schedule is rebuilt whenever the reminder list changes (and cleared on
 * logout). Telegram reminders from the backend keep working independently.
 */

const CHANNEL_ID = 'reminders';
const ID_BASE = 700000; // our ids live in [ID_BASE, ID_BASE + 100000)

/** True when this APK includes the LocalNotifications plugin (older APKs do not). */
export const nativeRemindersAvailable = isNativeApp && Capacitor.isPluginAvailable('LocalNotifications');

function idFor(reminderId: string): number {
  let h = 0;
  for (let i = 0; i < reminderId.length; i++) h = (h * 31 + reminderId.charCodeAt(i)) % 100000;
  return ID_BASE + h;
}

let channelReady = false;
let lastSignature = '';
let lastArgs: { reminders: any[]; title: string } | null = null;
let resumeHooked = false;

/** Android 12+: exact alarms need a user toggle ("Alarms & reminders"). */
export async function exactAlarmsAllowed(): Promise<boolean> {
  if (!nativeRemindersAvailable) return true;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const r: any = await LocalNotifications.checkExactNotificationSetting();
    return r?.exact_alarm !== 'denied';
  } catch {
    return true;
  }
}

/** Opens the system "Alarms & reminders" page; reminders are rescheduled on return. */
export async function openExactAlarmSettings(): Promise<void> {
  if (!nativeRemindersAvailable) return;
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  await LocalNotifications.changeExactNotificationSetting().catch(() => {});
}

async function hookResume() {
  if (resumeHooked) return;
  resumeHooked = true;
  const { App } = await import('@capacitor/app');
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive && lastArgs) {
      lastSignature = ''; // permissions may have changed in system settings
      syncReminderNotifications(lastArgs.reminders, lastArgs.title);
    }
  });
}

export async function syncReminderNotifications(
  reminders: Array<{ _id: string; name: string; dose?: string; time: string; type?: string; isActive?: boolean }>,
  title: string,
): Promise<void> {
  if (!nativeRemindersAvailable) return;
  lastArgs = { reminders, title };
  hookResume();
  const { LocalNotifications } = await import('@capacitor/local-notifications');

  const active = reminders.filter(r => r.isActive !== false && /^\d{1,2}:\d{2}$/.test(r.time || ''));
  const signature = JSON.stringify([title, active.map(r => [r._id, r.name, r.dose, r.time, r.type])]);
  if (signature === lastSignature) return;

  try {
    // Remove what we scheduled before
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(n => n.id >= ID_BASE && n.id < ID_BASE + 100000);
    if (ours.length) await LocalNotifications.cancel({ notifications: ours.map(n => ({ id: n.id })) });

    if (active.length === 0) {
      lastSignature = signature;
      return;
    }

    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return; // user said no; Telegram reminders still work

    // Exact delivery needs the "Alarms & reminders" toggle (Android 12+).
    const exact = await exactAlarmsAllowed();

    if (!channelReady && Capacitor.getPlatform() === 'android') {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: 'Eslatmalar',
        description: 'Dori va insulin eslatmalari',
        importance: 5,
        visibility: 1,
        vibration: true,
        lights: true,
        lightColor: '#0E7490',
      });
      channelReady = true;
    }

    await LocalNotifications.schedule({
      notifications: active.map(r => {
        const [hour, minute] = r.time.split(':').map(Number);
        return {
          id: idFor(r._id),
          title: `${r.type === 'insulin' ? '💉' : '💊'} ${title}`,
          body: r.dose ? `${r.name} — ${r.dose}` : r.name,
          channelId: CHANNEL_ID,
          schedule: { on: { hour, minute }, allowWhileIdle: true },
          // false = never open the "Alarms & reminders" screen on its own; Android then
          // delivers inexactly (usually within minutes). The dialog offers the toggle.
          isExactNotification: exact,
          extra: { kind: 'reminder', reminderId: r._id },
        };
      }),
    });
    lastSignature = signature;
  } catch (err) {
    console.warn('Reminder notifications could not be scheduled', err);
  }
}

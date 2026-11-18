import { Capacitor } from '@capacitor/core';
import { isNativeApp } from './platform';

/**
 * Phone notifications for medication/insulin reminders (Android app only).
 *
 * Each active reminder is scheduled on the device for the next DAYS_AHEAD days as
 * separate one-shot exact alarms at its HH:MM, so it fires even when the app is
 * closed, the phone is asleep, or offline. (The plugin's own daily repeat re-arms
 * itself with a non-wakeup RTC alarm, which a sleeping phone only shows once the
 * screen is turned on — so we do not use it.) The window is refreshed every time
 * the app is opened or resumed, and cleared on logout.
 * Telegram reminders from the backend keep working independently.
 */

const CHANNEL_ID = 'reminders';
const DAYS_AHEAD = 21;
// Our notification ids: [ID_BASE, ID_BASE + 50000 * 32). Older builds used [700000, 800000).
const ID_BASE = 1_000_000;
const ID_SPAN = 50000 * 32;
const isOurs = (id: number) => (id >= ID_BASE && id < ID_BASE + ID_SPAN) || (id >= 700000 && id < 800000);

/** True when this APK includes the LocalNotifications plugin (older APKs do not). */
export const nativeRemindersAvailable = isNativeApp && Capacitor.isPluginAvailable('LocalNotifications');

function idFor(reminderId: string, day: number): number {
  let h = 0;
  for (let i = 0; i < reminderId.length; i++) h = (h * 31 + reminderId.charCodeAt(i)) % 50000;
  return ID_BASE + h * 32 + day;
}

/** Next DAYS_AHEAD occurrences of HH:MM in the phone's local time (today's only if still ahead). */
function upcoming(hour: number, minute: number): Date[] {
  const now = new Date();
  const out: Date[] = [];
  for (let day = 0; out.length < DAYS_AHEAD && day <= DAYS_AHEAD; day++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, hour, minute, 0, 0);
    if (d.getTime() > now.getTime() + 5000) out.push(d);
  }
  return out;
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
  // Includes today's date so the 21-day window moves forward once a day
  const signature = JSON.stringify([new Date().toDateString(), title, active.map(r => [r._id, r.name, r.dose, r.time, r.type])]);
  if (signature === lastSignature) return;

  try {
    // Remove what we scheduled before
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(n => isOurs(n.id));
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
      notifications: active.flatMap(r => {
        const [hour, minute] = r.time.split(':').map(Number);
        return upcoming(hour, minute).map((at, i) => ({
          id: idFor(r._id, i),
          title: `${r.type === 'insulin' ? '💉' : '💊'} ${title}`,
          body: r.dose ? `${r.name} — ${r.dose}` : r.name,
          channelId: CHANNEL_ID,
          // one-shot + allowWhileIdle => exact RTC_WAKEUP alarm (wakes a sleeping phone)
          schedule: { at, allowWhileIdle: true },
          // false = never open the "Alarms & reminders" screen on its own (USE_EXACT_ALARM
          // normally grants it at install; if not, Android delivers inexactly)
          isExactNotification: exact,
          extra: { kind: 'reminder', reminderId: r._id },
        }));
      }),
    });
    lastSignature = signature;
  } catch (err) {
    console.warn('Reminder notifications could not be scheduled', err);
  }
}

export interface ReminderNotificationStatus {
  native: boolean;          // running inside the Android app
  available: boolean;       // this APK has the notifications plugin
  permission?: string;      // granted / denied / prompt
  exact?: string;           // exact alarms: granted / denied
  scheduled?: number;       // reminder notifications waiting on the phone
  next?: string;            // next one (local time)
  error?: string;
}

/** Snapshot of the phone-side reminder setup, shown in the reminders dialog. */
export async function getReminderNotificationStatus(): Promise<ReminderNotificationStatus> {
  if (!isNativeApp) return { native: false, available: false };
  if (!nativeRemindersAvailable) return { native: true, available: false };
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const perm = await LocalNotifications.checkPermissions();
    const exact: any = await LocalNotifications.checkExactNotificationSetting().catch(() => ({}));
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(n => isOurs(n.id));
    const times = ours
      .map(n => (n.schedule as any)?.at ? new Date((n.schedule as any).at).getTime() : NaN)
      .filter(t => !Number.isNaN(t) && t > Date.now())
      .sort((a, b) => a - b);
    const next = times.length ? new Date(times[0]) : null;
    return {
      native: true,
      available: true,
      permission: perm.display,
      exact: exact?.exact_alarm,
      scheduled: ours.length,
      next: next ? `${next.toLocaleDateString()} ${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}` : undefined,
    };
  } catch (err: any) {
    return { native: true, available: true, error: String(err?.message || err) };
  }
}

/** Schedules a one-off test notification ~1 minute from now (asks for permission if needed). */
export async function sendTestNotification(title: string, body: string): Promise<{ ok: boolean; at?: string; error?: string }> {
  if (!nativeRemindersAvailable) return { ok: false, error: 'plugin' };
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
    if (perm.display !== 'granted') return { ok: false, error: 'permission' };
    if (!channelReady && Capacitor.getPlatform() === 'android') {
      await LocalNotifications.createChannel({ id: CHANNEL_ID, name: 'Eslatmalar', description: 'Dori va insulin eslatmalari', importance: 5, visibility: 1, vibration: true });
      channelReady = true;
    }
    const exact = await exactAlarmsAllowed();
    const at = new Date(Date.now() + 60000);
    await LocalNotifications.schedule({
      notifications: [{ id: ID_BASE - 1, title, body, channelId: CHANNEL_ID, schedule: { at, allowWhileIdle: true }, isExactNotification: exact }],
    });
    return { ok: true, at: `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}` };
  } catch (err: any) {
    return { ok: false, error: String(err?.message || err) };
  }
}

/** Removes every reminder notification from the phone (explicit logout only). */
export async function clearReminderNotifications(): Promise<void> {
  lastArgs = null;
  lastSignature = '';
  if (!nativeRemindersAvailable) return;
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications');
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(n => isOurs(n.id) || n.id === ID_BASE - 1);
    if (ours.length) await LocalNotifications.cancel({ notifications: ours.map(n => ({ id: n.id })) });
  } catch { /* ignore */ }
}

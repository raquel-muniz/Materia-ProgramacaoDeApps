import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { NotificationResponse } from "expo-notifications";
import { getReminders, saveReminders } from "./storage";
import type { Reminder } from "./types";

function ensureNativePlatform() {
  if (Platform.OS === "web") {
    throw new Error(
      "Notificações agendadas não estão disponíveis nesta versão do navegador."
    );
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  ensureNativePlatform();

  const current = await Notifications.getPermissionsAsync();

  if (current.status === "granted") {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === "granted";
}

function nextDate(time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  if (date.getTime() <= Date.now()) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

export async function scheduleReminder(
  reminder: Reminder
): Promise<string> {
  ensureNativePlatform();

  const allowed = await requestNotificationPermission();

  if (!allowed) {
    throw new Error(
      "Permita notificações nas configurações do dispositivo."
    );
  }

  const [hours, minutes] = reminder.time.split(":").map(Number);

  const content = {
    title: reminder.title,
    body: reminder.description || "Está na hora do seu lembrete.",
    data: { reminderId: reminder.id },
    categoryIdentifier: "REMINDER_ACTIONS",
  };

  if (reminder.recurrence === "daily") {
    return Notifications.scheduleNotificationAsync({
      content,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
        channelId: "lembretes",
      } as Notifications.DailyTriggerInput,
    });
  }

  return Notifications.scheduleNotificationAsync({
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextDate(reminder.time),
      channelId: "lembretes",
    } as Notifications.DateTriggerInput,
  });
}

export async function registerNotificationActions(): Promise<void> {
  ensureNativePlatform();

  await Notifications.setNotificationCategoryAsync(
    "REMINDER_ACTIONS",
    [
      {
        identifier: "COMPLETE",
        buttonTitle: "Concluir",
        options: { opensAppToForeground: false },
      },
      {
        identifier: "SNOOZE",
        buttonTitle: "Adiar 10 min",
        options: { opensAppToForeground: false },
      },
    ]
  );
}

export async function cancelReminderNotification(
  reminder: Reminder
): Promise<void> {
  ensureNativePlatform();

  if (!reminder.notificationId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(
    reminder.notificationId
  );
}

export async function cancelAllReminderNotifications(): Promise<void> {
  ensureNativePlatform();

  await Notifications.cancelAllScheduledNotificationsAsync();

  const reminders = await getReminders();

  const updated = reminders.map((reminder) => ({
    ...reminder,
    notificationId: undefined,
  }));

  await saveReminders(updated);
}

export async function handleNotificationResponse(
  response: NotificationResponse
): Promise<void> {
  ensureNativePlatform();

  const action = response.actionIdentifier;
  const reminderId =
    response.notification.request.content.data?.reminderId;

  if (typeof reminderId !== "string") {
    return;
  }

  const reminders = await getReminders();
  const reminder = reminders.find((item) => item.id === reminderId);

  if (!reminder) {
    return;
  }

  if (action === "COMPLETE") {
    if (reminder.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(
        reminder.notificationId
      ).catch(() => undefined);
    }

    const updated = reminders.map((item) =>
      item.id === reminderId
        ? {
            ...item,
            completed: true,
            notificationId: undefined,
          }
        : item
    );

    await saveReminders(updated);
    return;
  }

  if (action === "SNOOZE") {
    const allowed = await requestNotificationPermission();

    if (!allowed) {
      return;
    }

    const newId = await Notifications.scheduleNotificationAsync({
      content: {
        title: reminder.title,
        body: reminder.description || "Lembrete adiado: está na hora!",
        data: { reminderId: reminder.id },
        categoryIdentifier: "REMINDER_ACTIONS",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 600,
        channelId: "lembretes",
      } as Notifications.TimeIntervalTriggerInput,
    });

    const updated = reminders.map((item) =>
      item.id === reminderId
        ? { ...item, notificationId: newId }
        : item
    );

    await saveReminders(updated);
  }
}
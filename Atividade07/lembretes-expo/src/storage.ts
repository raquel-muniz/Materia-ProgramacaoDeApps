import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Reminder } from "./types";

const STORAGE_KEY = "@lembretes/reminders";

export async function getReminders(): Promise<Reminder[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Reminder[]) : [];
  } catch {
    return [];
  }
}

export async function saveReminders(
  reminders: Reminder[]
): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(reminders)
  );
}

export async function updateReminder(
  id: string,
  patch: Partial<Reminder>
) {
  const reminders = await getReminders();

  const updated = reminders.map((item) =>
    item.id === id ? { ...item, ...patch } : item
  );

  await saveReminders(updated);
  return updated;
}
export type Recurrence = "once" | "daily";

export type Reminder = {
  id: string;
  title: string;
  description: string;
  time: string; // HH:mm
  recurrence: Recurrence;
  notificationId?: string;
  completed: boolean;
  createdAt: string;
};

import { useCallback, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import {
  cancelAllReminderNotifications,
  cancelReminderNotification,
  scheduleReminder,
} from "../../src/notifications";
import { getReminders, saveReminders } from "../../src/storage";
import type { Reminder } from "../../src/types";

const BLUE = "#2867C7";

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const savedReminders = await getReminders();
    setReminders(savedReminders);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function refresh() {
    setRefreshing(true);

    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }

  async function complete(item: Reminder) {
    try {
      if (Platform.OS !== "web") {
        await cancelReminderNotification(item);
      }

      const savedReminders = await getReminders();
      const updated = savedReminders.map((reminder) =>
        reminder.id === item.id
          ? {
              ...reminder,
              completed: true,
              notificationId: undefined,
            }
          : reminder
      );

      await saveReminders(updated);
      setReminders(updated);
    } catch (error) {
      console.error("Erro ao concluir lembrete:", error);

      if (Platform.OS !== "web") {
        Alert.alert(
          "Erro",
          "Não foi possível concluir o lembrete. Tente novamente."
        );
      }
    }
  }

  async function cancelOne(item: Reminder) {
    if (Platform.OS === "web") return;

    try {
      await cancelReminderNotification(item);

      const savedReminders = await getReminders();
      const updated = savedReminders.map((reminder) =>
        reminder.id === item.id
          ? { ...reminder, notificationId: undefined }
          : reminder
      );

      await saveReminders(updated);
      setReminders(updated);

      Alert.alert(
        "Notificação cancelada",
        `O aviso de "${item.title}" foi cancelado. O lembrete continua salvo.`
      );
    } catch (error) {
      console.error("Erro ao cancelar notificação:", error);

      Alert.alert(
        "Erro",
        "Não foi possível cancelar a notificação. Tente novamente."
      );
    }
  }

  async function cancelAll() {
    if (Platform.OS === "web") return;

    Alert.alert(
      "Cancelar todas as notificações?",
      "Todos os avisos serão cancelados, mas seus lembretes continuarão salvos.",
      [
        {
          text: "Voltar",
          style: "cancel",
        },
        {
          text: "Cancelar todas",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAllReminderNotifications();
              await load();

              Alert.alert(
                "Operação concluída",
                "Todas as notificações pendentes foram canceladas."
              );
            } catch (error) {
              console.error("Erro ao cancelar notificações:", error);

              Alert.alert(
                "Erro",
                "Não foi possível cancelar todas as notificações. Tente novamente."
              );
            }
          },
        },
      ]
    );
  }

  async function reschedule(item: Reminder) {
    if (Platform.OS === "web") return;

    try {
      const notificationId = await scheduleReminder({
        ...item,
        completed: false,
      });

      const savedReminders = await getReminders();
      const updated = savedReminders.map((reminder) =>
        reminder.id === item.id
          ? {
              ...reminder,
              completed: false,
              notificationId,
            }
          : reminder
      );

      await saveReminders(updated);
      setReminders(updated);

      Alert.alert(
        "Notificação ativada",
        "O lembrete foi agendado novamente."
      );
    } catch (error) {
      console.error("Erro ao reagendar:", error);

      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível reagendar o lembrete."
      );
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus lembretes</Text>

        <Text style={styles.subtitle}>
          {reminders.length}{" "}
          {reminders.length === 1
            ? "lembrete cadastrado"
            : "lembretes cadastrados"}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refresh()}
          />
        }
      >
        {reminders.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔔</Text>

            <Text style={styles.emptyTitle}>
              Tudo tranquilo por aqui!
            </Text>

            <Text style={styles.emptyText}>
              Crie seu primeiro lembrete na aba “Novo lembrete”.
            </Text>
          </View>
        ) : (
          reminders.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                item.completed && styles.completedCard,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.timeBubble}>
                  <Text style={styles.time}>{item.time}</Text>
                </View>

                <View style={styles.info}>
                  <Text
                    style={[
                      styles.name,
                      item.completed && styles.muted,
                    ]}
                  >
                    {item.title}
                  </Text>

                  <Text style={styles.description}>
                    {item.description || "Sem descrição"}
                  </Text>

                  <Text style={styles.meta}>
                    {item.recurrence === "daily"
                      ? "↻ Todos os dias"
                      : "◷ Lembrete único"}
                  </Text>

                  {item.completed && (
                    <Text style={styles.doneLabel}>
                      ✓ Concluído
                    </Text>
                  )}

                  {!item.completed && Platform.OS === "web" && (
                    <Text style={styles.infoLabel}>
                      Notificação agendada indisponível no navegador
                    </Text>
                  )}

                  {!item.completed &&
                    Platform.OS !== "web" &&
                    !item.notificationId && (
                      <Text style={styles.cancelledLabel}>
                        Notificação não agendada
                      </Text>
                    )}

                  {!item.completed &&
                    Platform.OS !== "web" &&
                    item.notificationId && (
                      <Text style={styles.activeLabel}>
                        ✓ Notificação agendada
                      </Text>
                    )}
                </View>
              </View>

              <View style={styles.actions}>
                {!item.completed && (
                  <Pressable
                    style={styles.actionButton}
                    onPress={() => void complete(item)}
                  >
                    <Text style={styles.actionText}>Concluir</Text>
                  </Pressable>
                )}

                {Platform.OS !== "web" &&
                  !item.completed &&
                  item.notificationId && (
                    <Pressable
                      style={styles.actionButton}
                      onPress={() => void cancelOne(item)}
                    >
                      <Text style={styles.cancelText}>
                        Cancelar aviso
                      </Text>
                    </Pressable>
                  )}

                {Platform.OS !== "web" &&
                  !item.completed &&
                  !item.notificationId && (
                    <Pressable
                      style={styles.actionButtonPrimary}
                      onPress={() => void reschedule(item)}
                    >
                      <Text style={styles.primaryText}>
                        Reagendar
                      </Text>
                    </Pressable>
                  )}
              </View>
            </View>
          ))
        )}

        {Platform.OS !== "web" && reminders.length > 0 && (
          <Pressable
            style={styles.cancelAll}
            onPress={cancelAll}
          >
            <Text style={styles.cancelAllText}>
              Cancelar todas as notificações
            </Text>
          </Pressable>
        )}

        <Text style={styles.note}>
          {Platform.OS === "web"
            ? "Os lembretes ficam salvos neste navegador. Para testar notificações agendadas, execute o app em um dispositivo Android ou iOS."
            : "Para testar uma notificação, escolha um horário alguns minutos à frente. O adiamento de 10 minutos fica disponível nas ações da notificação do sistema."}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  header: {
    paddingTop: 28,
    paddingHorizontal: 22,
    paddingBottom: 17,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#172033",
  },
  subtitle: {
    marginTop: 5,
    color: "#737D8D",
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 28,
    gap: 12,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E5EAF2",
  },
  completedCard: {
    opacity: 0.72,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  timeBubble: {
    minWidth: 66,
    height: 48,
    paddingHorizontal: 7,
    borderRadius: 13,
    backgroundColor: "#DCEAFF",
    alignItems: "center",
    justifyContent: "center",
  },
  time: {
    color: BLUE,
    fontSize: 15,
    fontWeight: "800",
  },
  info: {
    flex: 1,
  },
  name: {
    color: "#202A3A",
    fontSize: 16,
    fontWeight: "800",
  },
  muted: {
    textDecorationLine: "line-through",
    color: "#7D8797",
  },
  description: {
    marginTop: 4,
    color: "#687386",
    fontSize: 13,
    lineHeight: 18,
  },
  meta: {
    marginTop: 7,
    color: "#6E7786",
    fontSize: 12,
  },
  doneLabel: {
    color: "#247747",
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
  },
  activeLabel: {
    color: "#247747",
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
  },
  cancelledLabel: {
    color: "#A15B28",
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700",
  },
  infoLabel: {
    color: "#687386",
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#EEF0F4",
    paddingTop: 12,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: "#D8E2F2",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionText: {
    color: BLUE,
    fontWeight: "700",
    fontSize: 12,
  },
  cancelText: {
    color: "#A04444",
    fontWeight: "700",
    fontSize: 12,
  },
  actionButtonPrimary: {
    backgroundColor: BLUE,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  cancelAll: {
    alignItems: "center",
    padding: 14,
  },
  cancelAllText: {
    color: "#A04444",
    fontWeight: "700",
  },
  empty: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  emptyIcon: {
    fontSize: 38,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#202A3A",
  },
  emptyText: {
    color: "#737D8D",
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },
  note: {
    color: "#818A99",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 5,
    marginTop: 8,
  },
});
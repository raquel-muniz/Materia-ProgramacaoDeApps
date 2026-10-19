import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { scheduleReminder } from "../../src/notifications";
import { getReminders, saveReminders } from "../../src/storage";
import type { Recurrence, Reminder } from "../../src/types";

const BLUE = "#2867C7";

export default function NewReminderScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("08:00");
  const [recurrence, setRecurrence] = useState<Recurrence>("daily");
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({
    title: false,
    description: false,
    time: false,
  });

  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"error" | "success">("error");

  function showToast(
    message: string,
    type: "error" | "success" = "error"
  ) {
    setToastType(type);
    setToast(message);
  }

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setTime("08:00");
    setRecurrence("daily");
    setErrors({
      title: false,
      description: false,
      time: false,
    });
  }

  async function createReminder() {
    if (saving) return;

    const newErrors = {
      title: !title.trim(),
      description: !description.trim(),
      time: !time.trim(),
    };

    if (newErrors.title || newErrors.description || newErrors.time) {
      setErrors(newErrors);
      showToast("Preencha todos os campos obrigatórios.", "error");
      return;
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setErrors({
        title: false,
        description: false,
        time: true,
      });
      showToast("Informe um horário válido, como 08:30.", "error");
      return;
    }

    setErrors({
      title: false,
      description: false,
      time: false,
    });

    setSaving(true);

    const reminder: Reminder = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      description: description.trim(),
      time,
      recurrence,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    try {
      // Salva primeiro o lembrete, independentemente da plataforma.
      const current = await getReminders();
      await saveReminders([reminder, ...current]);

      resetForm();

      if (Platform.OS === "web") {
        showToast(
          "Lembrete salvo! Notificações agendadas não estão disponíveis nesta versão do navegador.",
          "success"
        );
        return;
      }

      // No Android/iOS, tenta agendar a notificação.
      try {
        const notificationId = await scheduleReminder(reminder);

        // Atualiza somente o lembrete criado, preservando os demais.
        const saved = await getReminders();
        const updated = saved.map((item) =>
          item.id === reminder.id
            ? { ...item, notificationId }
            : item
        );

        await saveReminders(updated);

        showToast("Lembrete salvo e notificação agendada!", "success");
      } catch (error) {
        console.error("Erro ao agendar notificação:", error);

        showToast(
          "Lembrete salvo, mas a notificação não foi agendada. Verifique as permissões do dispositivo.",
          "error"
        );

        Alert.alert(
          "Lembrete salvo",
          "O lembrete foi salvo, mas não foi possível agendar a notificação. Verifique as permissões do dispositivo."
        );
      }
    } catch (error) {
      console.error("Erro ao salvar lembrete:", error);

      showToast("Não foi possível salvar o lembrete. Tente novamente.", "error");

      Alert.alert(
        "Erro ao salvar",
        "Não foi possível salvar o lembrete. Tente novamente."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.headerIcon}>＋</Text>
          </View>

          <Text style={styles.title}>Novo lembrete</Text>
          <Text style={styles.subtitle}>
            Organize seu dia, uma tarefa de cada vez.
          </Text>
        </View>

        {toast && (
          <View
            style={[
              styles.toast,
              toastType === "success" ? styles.toastSuccess : styles.toastError,
            ]}
          >
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={[styles.label, errors.title && styles.labelError]}>
            Nome do lembrete *
          </Text>

          <TextInput
            value={title}
            onChangeText={(value) => {
              setTitle(value);
              if (value.trim()) {
                setErrors((previous) => ({ ...previous, title: false }));
              }
            }}
            placeholder="Ex.: Beber água"
            style={[styles.input, errors.title && styles.inputError]}
            maxLength={70}
            accessibilityLabel="Nome do lembrete"
          />

          <Text
            style={[
              styles.label,
              errors.description && styles.labelError,
            ]}
          >
            Descrição *
          </Text>

          <TextInput
            value={description}
            onChangeText={(value) => {
              setDescription(value);
              if (value.trim()) {
                setErrors((previous) => ({
                  ...previous,
                  description: false,
                }));
              }
            }}
            placeholder="Ex.: Beber um copo de 300 ml"
            style={[
              styles.input,
              styles.multiline,
              errors.description && styles.inputError,
            ]}
            multiline
            maxLength={180}
            accessibilityLabel="Descrição do lembrete"
          />

          <Text style={[styles.label, errors.time && styles.labelError]}>
            Horário *
          </Text>

          <TextInput
            value={time}
            onChangeText={(value) => {
              setTime(value);
              if (value.trim()) {
                setErrors((previous) => ({ ...previous, time: false }));
              }
            }}
            placeholder="08:00"
            style={[styles.input, errors.time && styles.inputError]}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
            accessibilityLabel="Horário do lembrete"
          />

          <Text style={styles.label}>Repetição</Text>

          <View style={styles.options}>
            <Pressable
              onPress={() => setRecurrence("once")}
              style={[
                styles.option,
                recurrence === "once" && styles.optionActive,
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionText,
                  recurrence === "once" && styles.optionTextActive,
                ]}
              >
                Única
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setRecurrence("daily")}
              style={[
                styles.option,
                recurrence === "daily" && styles.optionActive,
              ]}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.optionText,
                  recurrence === "daily" && styles.optionTextActive,
                ]}
              >
                Diária
              </Text>
            </Pressable>
          </View>

          <Pressable
            disabled={saving}
            onPress={() => void createReminder()}
            style={[styles.button, saving && styles.disabled]}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {saving ? "Salvando..." : "Salvar lembrete"}
            </Text>
          </Pressable>

          <Text style={styles.footnote}>
            * Campos obrigatórios. No Android e iOS, permita as notificações
            para receber os avisos agendados.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  container: {
    padding: 20,
    paddingBottom: 34,
  },
  header: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 22,
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#DCEAFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerIcon: {
    fontSize: 34,
    color: BLUE,
    lineHeight: 39,
  },
  title: {
    fontSize: 27,
    fontWeight: "800",
    color: "#172033",
  },
  subtitle: {
    fontSize: 14,
    color: "#697386",
    marginTop: 6,
    textAlign: "center",
  },
  toast: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  toastSuccess: {
    backgroundColor: "#DFF5E8",
  },
  toastError: {
    backgroundColor: "#FCE8E6",
  },
  toastText: {
    color: "#263244",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E7EBF2",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#30394A",
    marginBottom: 8,
    marginTop: 15,
  },
  labelError: {
    color: "#B42318",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D9DFE8",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#172033",
    backgroundColor: "#FCFDFE",
  },
  inputError: {
    borderColor: "#D92D20",
  },
  multiline: {
    minHeight: 78,
    textAlignVertical: "top",
  },
  options: {
    flexDirection: "row",
    gap: 10,
  },
  option: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9DFE8",
    alignItems: "center",
  },
  optionActive: {
    backgroundColor: "#DCEAFF",
    borderColor: "#80ACEF",
  },
  optionText: {
    color: "#555F70",
    fontWeight: "600",
  },
  optionTextActive: {
    color: BLUE,
  },
  button: {
    marginTop: 24,
    backgroundColor: BLUE,
    borderRadius: 13,
    padding: 16,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  footnote: {
    fontSize: 12,
    color: "#818A99",
    marginTop: 13,
    lineHeight: 17,
  },
});
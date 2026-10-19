import { Stack } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import {
  handleNotificationResponse,
  registerNotificationActions,
} from "../src/notifications";

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export default function RootLayout() {
  useEffect(() => {
    // Não registra recursos nativos de notificação no navegador.
    if (Platform.OS === "web") {
      return;
    }

    async function configureNotifications() {
      try {
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync(
            "lembretes",
            {
              name: "Lembretes",
              importance: Notifications.AndroidImportance.MAX,
              vibrationPattern: [0, 250, 250, 250],
              lightColor: "#3977D5",
            }
          );
        }

        await registerNotificationActions();
      } catch (error) {
        console.error(
          "Erro ao configurar notificações:",
          error
        );
      }
    }

    void configureNotifications();

    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          void handleNotificationResponse(response).catch((error) => {
            console.error(
              "Erro ao processar ação da notificação:",
              error
            );
          });
        }
      );

    return () => {
      subscription.remove();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
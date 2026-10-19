import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2867C7",
        tabBarInactiveTintColor: "#777F8C",
        tabBarStyle: { height: 66, paddingTop: 7, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Novo lembrete",
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="lembretes"
        options={{
          title: "Lembretes",
          tabBarIcon: ({ color, size }) => <Ionicons name="notifications-outline" color={color} size={size} />
        }}
      />
    </Tabs>
  );
}

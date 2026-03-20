import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { inventoryApi } from "@/services/inventoryService";
import { useApprovalStore } from "@/store/useApprovalStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  ClipboardList,
  Clock,
  FileText,
  Lightbulb,
  Package,
  Settings,
  UserCircle2,
  Users,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function OwnerDashboard({ username }: { username: string }) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { tasks, fetchTasks } = useTaskStore();
  const { pendingRequests, fetchPendingRequests } = useApprovalStore();
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);
  const {
    items: inventoryItems,
    fetchItems: fetchInventory,
    recommendations,
    fetchRecommendations,
  } = useInventoryStore();

 const { user } = useAuthStore();

  useEffect(() => {

    if (!user?.token) {
      return; 
    }
    fetchTasks();
    fetchPendingRequests();
    fetchInventory();
    fetchRecommendations();
    
    inventoryApi
      .getExpiryReport()
      .then((data) => {
        setExpiringSoonCount(data.expiringSoon.length);
      })
      .catch((err) => console.log("Failed to fetch expiry count:", err.message));
      
  }, [user?.token]);

  const pendingRequestsCount = pendingRequests.length;

  const activeTasks = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled",
  );
  const tasksCount = activeTasks.length;

  const overdueTasksCount = activeTasks.filter((t) => {
    const due = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const lowStockCount = inventoryItems.filter((item) => {
    const current = item.currentStock || 0;
    return (
      current <= (item.minStockLevel || 0) && (item.minStockLevel || 0) > 0
    );
  }).length;

  const recommendationsCount = recommendations?.length || 0;

  const handleNavigate = (destination: string) => {
    if (destination === "inventory") {
      router.push("/(tabs)/(inventory)/" as any);
    } else if (destination === "transactions-hub") {
      router.push("/(tabs)/(transactions)/" as any);
    } else if (destination === "suppliers") {
      router.push("/(tabs)/(suppliers)/" as any);
    } else if (destination === "purchase-orders") {
      router.push("/(tabs)/(purchase-orders)/" as any);
    } else if (destination === "user-management") {
      router.push("/(tabs)/(users)/" as any);
    } else if (destination === "tasks") {
      router.push("/(tabs)/(tasks)/" as any);
    } else if (destination === "approval-center") {
      router.push("/(tabs)/(approvals)/" as any);
    } else if (destination === "low-stock") {
      router.push("/(tabs)/(low-stock)/" as any);
    } else if (
      destination === "expiry-management" ||
      destination === "expiry-management-expiring"
    ) {
      router.push("/(tabs)/(expiry)/" as any);
    } else if (destination === "recommendations") {
      router.push("/(tabs)/(recommendations)" as any);
    } else if (destination === "analytics") {
      router.push("/(tabs)/(analytics)/" as any);
    } else if (destination === "reorder-settings") {
      router.push("/(tabs)/(settings)/" as any);
    } else {
      router.push(`/(tabs)/${destination}` as any);
    }
  };
  const kpis = [
    {
      label: "Low Stock",
      value: lowStockCount,
      icon: AlertTriangle,
      color: theme.orange600,
      destination: "low-stock",
    },
    {
      label: "Recommendations",
      value: recommendationsCount,
      icon: Lightbulb,
      color: theme.blue600,
      destination: "recommendations",
    },
    {
      label: "Expiring Soon",
      value: expiringSoonCount,
      icon: Clock,
      color: theme.red600,
      destination: "expiry-management-expiring",
    },
  ];

  const navCards = [
    {
      title: "Approval Center",
      description: "Review pending reorder requests",
      icon: CheckCircle,
      bg: theme.green50,
      iconColor: theme.green600,
      destination: "approval-center",
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : undefined,
    },
    {
      title: "Tasks",
      description: "Assign and monitor staff tasks",
      icon: ClipboardList,
      bg: theme.blue50,
      iconColor: theme.blue600,
      destination: "tasks", // 👇 Updated destination string
      badge:
        overdueTasksCount > 0
          ? overdueTasksCount
          : tasksCount > 0
            ? tasksCount
            : undefined,
    },
    {
      title: "Low Stock Items",
      description: "Items below reorder point",
      icon: AlertTriangle,
      bg: theme.orange50,
      iconColor: theme.orange600,
      destination: "low-stock",
    },
    {
      title: "Smart Recommendations",
      description: "AI-powered suggestions",
      icon: Lightbulb,
      bg: "#FEFCE8",
      iconColor: "#CA8A04",
      destination: "recommendations",
      badge: recommendationsCount > 0 ? recommendationsCount : undefined, // 👇 Added badge here too!
    },
    {
      title: "Expiry Management",
      description: "Track expiring items",
      icon: Calendar,
      bg: theme.red50,
      iconColor: theme.red600,
      destination: "expiry-management",
    },
    {
      title: "Orders",
      description: "Draft & track purchase orders",
      icon: FileText,
      bg: theme.purple50,
      iconColor: theme.purple600,
      destination: "purchase-orders",
    },
    {
      title: "Analytics Dashboard",
      description: "View insights and reports",
      icon: BarChart3,
      bg: "#EEF2FF",
      iconColor: "#4F46E5",
      destination: "analytics",
    },
    {
      title: "Inventory Overview",
      description: "View all inventory items",
      icon: Package,
      bg: theme.gray50,
      iconColor: theme.gray600,
      destination: "inventory",
    },
    {
      title: "Transactions Hub",
      description: "Receive, Issue & Adjust",
      icon: ArrowUpDown,
      bg: theme.orange50,
      iconColor: theme.orange600,
      destination: "transactions-hub",
    },
    {
      title: "User Management",
      description: "Manage staff accounts",
      icon: Users,
      bg: "#F0FDFA",
      iconColor: "#0D9488",
      destination: "user-management",
    },
    {
      title: "Suppliers",
      description: "Manage supplier information",
      icon: Building2,
      bg: "#ECFEFF",
      iconColor: "#0891B2",
      destination: "suppliers",
    },
    {
      title: "Reorder Settings",
      description: "Configure reorder points",
      icon: Settings,
      bg: theme.gray50,
      iconColor: theme.gray600,
      destination: "reorder-settings",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.primary}
        translucent={false}
      />

      <View style={[styles.headerWrapper, { backgroundColor: theme.primary }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTextGroup}>
              <Text style={[styles.welcomeText, { fontFamily: Fonts?.sans }]}>
                Welcome back,
              </Text>
              <Text style={[styles.userNameText, { fontFamily: Fonts?.bold }]}>
                {username}
              </Text>
              <Text style={[styles.roleSubText, { fontFamily: Fonts?.sans }]}>
                Owner
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.profileBtn,
                { backgroundColor: "rgba(255, 255, 255, 0.1)" },
              ]}
              onPress={() => router.push("/profile" as any)}
            >
              <UserCircle2 size={28} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.kpiCard, { backgroundColor: theme.card }]}
              onPress={() => handleNavigate(kpi.destination)}
              activeOpacity={0.8}
            >
              <kpi.icon
                size={24}
                color={kpi.color}
                style={{ marginBottom: 8 }}
              />
              <Text
                style={[
                  styles.kpiValue,
                  { color: theme.textPrimary, fontFamily: Fonts?.bold },
                ]}
              >
                {kpi.value}
              </Text>
              <Text
                style={[
                  styles.kpiLabel,
                  { color: theme.textSecondary, fontFamily: Fonts?.sans },
                ]}
              >
                {kpi.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.navCardsContainer}>
          {navCards.map((card, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.navCard, { backgroundColor: theme.card }]}
              onPress={() => handleNavigate(card.destination)}
              activeOpacity={0.8}
            >
              <View
                style={[styles.navCardIconBox, { backgroundColor: card.bg }]}
              >
                <card.icon size={24} color={card.iconColor} strokeWidth={2} />
                {card.badge !== undefined && (
                  <View
                    style={[
                      styles.badgeContainer,
                      { backgroundColor: theme.danger },
                    ]}
                  >
                    <Text
                      style={[styles.badgeText, { fontFamily: Fonts?.bold }]}
                    >
                      {card.badge}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.navCardTextGroup}>
                <Text
                  style={[
                    styles.navCardTitle,
                    { color: theme.textPrimary, fontFamily: Fonts?.bold },
                  ]}
                >
                  {card.title}
                </Text>
                <Text
                  style={[
                    styles.navCardSub,
                    { color: theme.textSecondary, fontFamily: Fonts?.sans },
                  ]}
                  numberOfLines={1}
                >
                  {card.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerWrapper: { paddingBottom: 24 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headerTextGroup: { flex: 1 },
  welcomeText: { color: "white", fontSize: 24, marginBottom: 4 },
  userNameText: { color: "white", fontSize: 20, opacity: 0.9 },
  roleSubText: { color: "white", fontSize: 14, opacity: 0.75, marginTop: 4 },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContainer: { padding: 16, paddingBottom: 80 },

  kpiGrid: { flexDirection: "row", gap: 12, marginBottom: 24 },
  kpiCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiValue: { fontSize: 24, marginBottom: 4 },
  kpiLabel: { fontSize: 12, textAlign: "center" },

  navCardsContainer: { gap: 12 },
  navCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navCardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  badgeContainer: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
  },
  navCardTextGroup: { flex: 1 },
  navCardTitle: { fontSize: 16, marginBottom: 2 },
  navCardSub: { fontSize: 14 },
});

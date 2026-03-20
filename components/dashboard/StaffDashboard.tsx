import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { inventoryApi } from "@/services/inventoryService";
import { useAuthStore } from "@/store/useAuthStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowUpDown,
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Lightbulb,
  Package,
  UserCircle2,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react"; // Added useState & useCallback
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function StaffDashboard() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { user } = useAuthStore();
  const { tasks, fetchMyTasks, isLoading } = useTaskStore();
  const { items: inventoryItems, fetchItems: fetchInventory } =
    useInventoryStore();
  // Local state for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0); // 👈 NEW: State for real count

  const fetchExpiryCount = async () => {
    try {
      const data = await inventoryApi.getExpiryReport();
      setExpiringSoonCount(data.expiringSoon.length);
    } catch (error) {
      console.error("Failed to fetch expiry count:", error);
    }
  };

  useEffect(() => {
    if (!user?.token) {
      return;
    }

    fetchMyTasks();
    fetchInventory();
    fetchExpiryCount();
  }, [user?.token]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchMyTasks();
      await fetchInventory();
      await fetchExpiryCount();
    } finally {
      setRefreshing(false);
    }
  }, [fetchMyTasks, fetchInventory]);

  const myActiveTasks = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled",
  );

  const overdueTasksCount = myActiveTasks.filter((t) => {
    const due = new Date(t.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

  const topTasks = myActiveTasks.slice(0, 2);
  const lowStockCount = inventoryItems.filter((item) => {
    const current = item.currentStock || 0;
    return (
      current <= (item.minStockLevel || 0) && (item.minStockLevel || 0) > 0
    );
  }).length;

  const recommendationsCount = 4;

  const handleNavigate = (destination: string) => {
    if (destination === "profile") router.push("/profile" as any);
    else if (destination === "inventory")
      router.push("/(tabs)/(inventory)/" as any);
    else if (destination === "transactions-hub")
      router.push("/(tabs)/(transactions)/" as any);
    else if (destination === "staff-tasks-list")
      router.push("/(tabs)/(tasks)/" as any);
    else if (destination === "my-requests")
      router.push("/(tabs)/(requests)/" as any);
    else if (destination === "low-stock")
      router.push("/(tabs)/(low-stock)/" as any);
    else if (destination === "expiry-management")
      router.push("/(tabs)/(expiry)/" as any);
    else if (destination === "recommendations")
      router.push("/(tabs)/(recommendations)" as any);
    else console.log("Navigate to:", destination);
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return { label: "Assigned", bg: "#DBEAFE", text: "#1D4ED8" };
      case "in-progress":
        return { label: "In Progress", bg: "#F3E8FF", text: "#7E22CE" };
      case "completed":
        return { label: "Completed", bg: "#DCFCE7", text: "#15803D" };
      default:
        return { label: status, bg: "#F3F4F6", text: "#4B5563" };
    }
  };

  const kpis = [
    {
      label: "Low Stock",
      value: lowStockCount,
      icon: AlertTriangle,
      color: "#EA580C",
      destination: "low-stock",
    },
    {
      label: "Suggestions",
      value: recommendationsCount,
      icon: Lightbulb,
      color: "#2563EB",
      destination: "recommendations",
    },
    {
      label: "Expiring",
      value: expiringSoonCount,
      icon: Clock,
      color: "#DC2626",
      destination: "expiry-management",
    },
  ];

  const navCards = [
    {
      title: "Low Stock Items",
      description: "View items below reorder point",
      icon: AlertTriangle,
      bg: "#FFF7ED",
      iconColor: "#EA580C",
      destination: "low-stock",
    },
    {
      title: "Expiry Management",
      description: "Track expiring and expired items",
      icon: Calendar,
      bg: "#FEF2F2",
      iconColor: "#DC2626",
      destination: "expiry-management",
    },
    {
      title: "Inventory",
      description: "Search and filter clinic stock",
      icon: Package,
      bg: "#F3F4F6",
      iconColor: "#4B5563",
      destination: "inventory",
    },
    {
      title: "Smart Recommendations",
      description: "AI-powered reorder suggestions",
      icon: Lightbulb,
      bg: "#EFF6FF",
      iconColor: "#2563EB",
      destination: "recommendations",
    },
    {
      title: "Transactions Hub",
      description: "Receive, Issue, & Adjust stock",
      icon: ArrowUpDown,
      bg: "#FAF5FF",
      iconColor: "#9333EA",
      destination: "transactions-hub",
    },
    {
      title: "My Requests",
      description: "Track reorder request status",
      icon: FileText,
      bg: "#F0FDF4",
      iconColor: "#16A34A",
      destination: "my-requests",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
        translucent={false}
      />

      <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTextGroup}>
              <Text style={[styles.welcomeText, { fontFamily: Fonts?.sans }]}>
                Welcome back,
              </Text>
              <Text style={[styles.userNameText, { fontFamily: Fonts?.bold }]}>
                {user?.username || "Staff"}
              </Text>
              <Text style={[styles.roleSubText, { fontFamily: Fonts?.sans }]}>
                Staff Member
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileBtn}
              onPress={() => handleNavigate("profile")}
            >
              <UserCircle2 size={32} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        // 👇 Added RefreshControl here
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB" // iOS color
            colors={["#2563EB"]} // Android color
          />
        }
      >
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.kpiCard}
              onPress={() => handleNavigate(kpi.destination)}
              activeOpacity={0.8}
            >
              <kpi.icon
                size={24}
                color={kpi.color}
                style={{ marginBottom: 8 }}
              />
              <Text style={[styles.kpiValue, { fontFamily: Fonts?.bold }]}>
                {kpi.value}
              </Text>
              <Text style={[styles.kpiLabel, { fontFamily: Fonts?.sans }]}>
                {kpi.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My Tasks Snapshot */}
        {myActiveTasks.length > 0 && (
          <TouchableOpacity
            style={styles.tasksCard}
            activeOpacity={0.8}
            onPress={() => handleNavigate("staff-tasks-list")}
          >
            <View style={styles.tasksHeader}>
              <View style={styles.tasksHeaderLeft}>
                <ClipboardList
                  size={20}
                  color="#2563EB"
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.tasksTitle, { fontFamily: Fonts?.bold }]}>
                  My Tasks
                </Text>
              </View>
              <View style={styles.tasksHeaderRight}>
                <Text style={styles.viewAllText}>View all</Text>
                <ChevronRight size={16} color="#2563EB" />
              </View>
            </View>

            <Text style={styles.tasksSubtitle}>
              You have {myActiveTasks.length} assigned{" "}
              {overdueTasksCount > 0 && (
                <Text style={{ color: "#DC2626" }}>
                  ({overdueTasksCount} overdue)
                </Text>
              )}
            </Text>

            <View style={styles.tasksList}>
              {topTasks.map((task) => {
                const badge = getTaskStatusBadge(task.status);
                const isOverdue =
                  new Date(task.dueDate) <
                  new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <View key={task.id} style={styles.taskItem}>
                    <View style={styles.taskItemTop}>
                      <Text
                        style={[
                          styles.taskItemTitle,
                          { fontFamily: Fonts?.bold },
                        ]}
                        numberOfLines={1}
                      >
                        {task.title}
                      </Text>
                      <View style={styles.taskBadges}>
                        <View
                          style={[styles.badge, { backgroundColor: badge.bg }]}
                        >
                          <Text
                            style={[styles.badgeText, { color: badge.text }]}
                          >
                            {badge.label}
                          </Text>
                        </View>
                        {isOverdue && (
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: "#FEE2E2", marginLeft: 4 },
                            ]}
                          >
                            <Text
                              style={[styles.badgeText, { color: "#B91C1C" }]}
                            >
                              Overdue
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={styles.taskItemDue}>
                      Due:{" "}
                      {new Date(task.dueDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </TouchableOpacity>
        )}

        {/* Navigation Cards */}
        <View style={styles.navCardsContainer}>
          {navCards.map((card, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.navCard}
              onPress={() => handleNavigate(card.destination)}
              activeOpacity={0.8}
            >
              <View
                style={[styles.navCardIconBox, { backgroundColor: card.bg }]}
              >
                <card.icon size={24} color={card.iconColor} strokeWidth={2} />
              </View>
              <View style={styles.navCardTextGroup}>
                <Text
                  style={[styles.navCardTitle, { fontFamily: Fonts?.bold }]}
                >
                  {card.title}
                </Text>
                <Text
                  style={[styles.navCardSub, { fontFamily: Fonts?.sans }]}
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
  welcomeText: { color: "white", fontSize: 20, marginBottom: 4, opacity: 0.9 },
  userNameText: { color: "white", fontSize: 24, marginBottom: 4 },
  roleSubText: { color: "white", fontSize: 14, opacity: 0.75 },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  scrollContainer: { padding: 16, paddingBottom: 80 },

  kpiGrid: { flexDirection: "row", gap: 12, marginBottom: 20 },
  kpiCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiValue: { fontSize: 22, color: "#111827", marginBottom: 4 },
  kpiLabel: { fontSize: 11, color: "#6B7280", textAlign: "center" },

  tasksCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tasksHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  tasksHeaderLeft: { flexDirection: "row", alignItems: "center" },
  tasksTitle: { fontSize: 16, color: "#111827" },
  tasksHeaderRight: { flexDirection: "row", alignItems: "center" },
  viewAllText: { fontSize: 13, color: "#2563EB", marginRight: 2 },
  tasksSubtitle: { fontSize: 13, color: "#6B7280", marginBottom: 12 },
  tasksList: { gap: 8 },
  taskItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  taskItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  taskItemTitle: { fontSize: 14, color: "#111827", flex: 1, marginRight: 8 },
  taskBadges: { flexDirection: "row" },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 10, fontWeight: "600" },
  taskItemDue: { fontSize: 12, color: "#6B7280" },

  navCardsContainer: { gap: 12 },
  navCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
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
  },
  navCardTextGroup: { flex: 1 },
  navCardTitle: { fontSize: 16, color: "#111827", marginBottom: 2 },
  navCardSub: { fontSize: 13, color: "#6B7280" },
});

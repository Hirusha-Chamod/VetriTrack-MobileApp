import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import {
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Plus,
    User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type StatusFilter =
  | "all"
  | "assigned"
  | "in-progress"
  | "completed"
  | "cancelled";
type DueFilter = "all" | "today" | "this-week" | "overdue";

export default function TasksListScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];


  const { user } = useAuthStore();
  const isOwner = user?.role === "owner";

  const { tasks, fetchTasks, fetchMyTasks, isLoading } = useTaskStore();
  const { users, fetchUsers } = useUserStore();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");

  useEffect(() => {
    // 👇 Fetch specific tasks based on role
    if (isOwner) {
      fetchTasks();
      if (users.length === 0) fetchUsers();
    } else {
      fetchMyTasks();
    }
  }, []);

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  const isToday = (dueDate: string) => {
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  const isThisWeek = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return due >= today && due <= weekFromNow;
  };

  // Filter Tasks

  let filteredTasks = isOwner
    ? tasks
    : tasks.filter((t) => t.status !== "cancelled");

  if (statusFilter !== "all")
    filteredTasks = filteredTasks.filter((t) => t.status === statusFilter);
  if (dueFilter === "today")
    filteredTasks = filteredTasks.filter((t) => isToday(t.dueDate));
  if (dueFilter === "this-week")
    filteredTasks = filteredTasks.filter((t) => isThisWeek(t.dueDate));
  if (dueFilter === "overdue")
    filteredTasks = filteredTasks.filter((t) => isOverdue(t.dueDate));

  // Sort Tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aOverdue = isOverdue(a.dueDate);
    const bOverdue = isOverdue(b.dueDate);
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "assigned":
        return { bg: "#DBEAFE", text: "#1D4ED8", label: "Assigned" };
      case "in-progress":
        return { bg: "#F3E8FF", text: "#7E22CE", label: "In Progress" };
      case "completed":
        return { bg: "#DCFCE7", text: "#15803D", label: "Completed" };
      case "cancelled":
        return { bg: "#F3F4F6", text: "#4B5563", label: "Cancelled" };
      default:
        return { bg: "#F3F4F6", text: "#4B5563", label: status };
    }
  };

  const renderTask = ({ item }: any) => {
    const statusUI = getStatusStyle(item.status);
    const taskOverdue =
      isOverdue(item.dueDate) &&
      item.status !== "completed" &&
      item.status !== "cancelled";

    return (
      <TouchableOpacity
        style={styles.taskCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/(tasks)/${item.id}` as any)}
      >
        <View style={styles.taskTop}>
          <Text style={[styles.taskTitle, { fontFamily: Fonts?.bold }]}>
            {item.title}
          </Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: statusUI.bg }]}>
            <Text style={[styles.badgeText, { color: statusUI.text }]}>
              {statusUI.label}
            </Text>
          </View>
          {item.priority && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    item.priority === "high" ? "#FEE2E2" : "#FFEDD5",
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: item.priority === "high" ? "#B91C1C" : "#C2410C" },
                ]}
              >
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
              </Text>
            </View>
          )}
          {taskOverdue && (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: "#FEE2E2",
                  flexDirection: "row",
                  alignItems: "center",
                },
              ]}
            >
              <AlertCircle
                size={12}
                color="#B91C1C"
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.badgeText, { color: "#B91C1C" }]}>
                Overdue
              </Text>
            </View>
          )}
        </View>

        <View style={styles.taskFooter}>
          {isOwner && (
            <View style={styles.footerItem}>
              <UserIcon size={14} color="#6B7280" style={{ marginRight: 6 }} />
              <Text style={styles.footerText}>{item.assignedToName}</Text>
            </View>
          )}
          <View style={styles.footerItem}>
            <Calendar size={14} color="#6B7280" style={{ marginRight: 6 }} />
            <Text style={styles.footerText}>
              {new Date(item.dueDate).toLocaleDateString("en-GB")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
        translucent={false}
      />

      {/* Header - Blue 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconBg}>
                <ClipboardList size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>

                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  {isOwner ? "All Tasks" : "My Tasks"}
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {tasks.length} total tasks
                </Text>
              </View>
            </View>

            {isOwner && (
              <TouchableOpacity
                style={styles.headerAddBtn}
                onPress={() => router.push("/(tabs)/(tasks)/create" as any)}
              >
                <Plus size={16} color="#2563EB" style={{ marginRight: 4 }} />
                <Text
                  style={[styles.headerAddText, { fontFamily: Fonts?.bold }]}
                >
                  Create
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Status</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            "all",
            "assigned",
            "in-progress",
            "completed",
            ...(isOwner ? ["cancelled"] : []),
          ].map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterChip,
                statusFilter === s && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(s as StatusFilter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === s && styles.filterChipTextActive,
                ]}
              >
                {s === "all"
                  ? "All"
                  : s === "in-progress"
                    ? "In Progress"
                    : s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.filterLabel, { marginTop: 12 }]}>Due Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {["all", "today", "this-week", "overdue"].map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.filterChip,
                dueFilter === d && styles.filterChipActive,
              ]}
              onPress={() => setDueFilter(d as DueFilter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  dueFilter === d && styles.filterChipTextActive,
                ]}
              >
                {d === "all"
                  ? "All"
                  : d === "this-week"
                    ? "This Week"
                    : d.charAt(0).toUpperCase() + d.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Task List */}
      {isLoading && tasks.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={sortedTasks}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={isOwner ? fetchTasks : fetchMyTasks}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <ClipboardList size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptyText}>
                Try adjusting your filters or create a new task.
              </Text>
            </View>
          }
          renderItem={renderTask}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerWrapper: { paddingBottom: 20 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: { paddingRight: 8 },
  headerTitleGroup: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerIconBg: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: { fontSize: 20, color: "white", marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  headerAddBtn: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerAddText: { color: "#2563EB", fontSize: 13 },

  filterSection: {
    backgroundColor: "white",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
  },
  filterChipActive: { backgroundColor: "#2563EB" },
  filterChipText: { fontSize: 13, color: "#4B5563", fontWeight: "500" },
  filterChipTextActive: { color: "white" },

  listContent: { padding: 16, paddingBottom: 40 },
  taskCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  taskTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  taskTitle: { fontSize: 16, color: "#111827", flex: 1, marginRight: 12 },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "600" },

  taskFooter: {
    flexDirection: "row",
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  footerItem: { flexDirection: "row", alignItems: "center" },
  footerText: { fontSize: 13, color: "#4B5563", fontWeight: "500" },

  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyIconBg: {
    width: 64,
    height: 64,
    backgroundColor: "#DBEAFE",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: { color: "#6B7280", fontSize: 14 },
});

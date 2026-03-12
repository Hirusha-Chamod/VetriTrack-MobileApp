import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTaskStore } from "@/store/useTaskStore";
import { useToastStore } from "@/store/useToastStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    AlertTriangle,
    Calendar,
    ChevronLeft,
    ClipboardList,
    Package,
    User as UserIcon,
    X
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const { tasks, updateTaskStatus, isLoading } = useTaskStore();
  const task = tasks.find((t) => t.id === id);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  if (!task) return null;

  const isOverdue =
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0)) &&
    task.status !== "completed" &&
    task.status !== "cancelled";

  const handleCancelTask = async () => {
    if (!cancelReason.trim()) {
      showToast("Please provide a reason", "error");
      return;
    }
    try {
      await updateTaskStatus(task.id, "cancelled", cancelReason.trim());
      setShowCancelModal(false);
      showToast("Task cancelled successfully", "success");
      router.back();
    } catch (error: any) {
      showToast(error.message || "Failed to cancel task", "error");
    }
  };

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
  const statusUI = getStatusStyle(task.status);

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
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconBg}>
                <ClipboardList size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Task Details
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Review task information
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Task Info */}
        <View style={styles.card}>
          <Text style={[styles.taskTitle, { fontFamily: Fonts?.bold }]}>
            {task.title}
          </Text>

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: statusUI.bg }]}>
              <Text style={[styles.badgeText, { color: statusUI.text }]}>
                {statusUI.label}
              </Text>
            </View>
            {task.priority && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      task.priority === "high" ? "#FEE2E2" : "#FFEDD5",
                    flexDirection: "row",
                    alignItems: "center",
                  },
                ]}
              >
                <AlertTriangle
                  size={12}
                  color={task.priority === "high" ? "#B91C1C" : "#C2410C"}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: task.priority === "high" ? "#B91C1C" : "#C2410C" },
                  ]}
                >
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}{" "}
                  Priority
                </Text>
              </View>
            )}
            {task.taskType && (
              <View style={[styles.badge, { backgroundColor: "#DBEAFE" }]}>
                <Text style={[styles.badgeText, { color: "#1D4ED8" }]}>
                  {task.taskType === "stock-count"
                    ? "Stock Count"
                    : task.taskType.charAt(0).toUpperCase() +
                      task.taskType.slice(1)}
                </Text>
              </View>
            )}
            {isOverdue && (
              <View style={[styles.badge, { backgroundColor: "#FEE2E2" }]}>
                <Text style={[styles.badgeText, { color: "#B91C1C" }]}>
                  Overdue
                </Text>
              </View>
            )}
          </View>

          <View style={styles.descSection}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.descText}>{task.description}</Text>
          </View>

          <View style={styles.gridInfo}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Assigned To</Text>
              <View style={styles.gridValueRow}>
                <UserIcon
                  size={16}
                  color="#6B7280"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.gridValue}>{task.assignedToName}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Due Date</Text>
              <View style={styles.gridValueRow}>
                <Calendar
                  size={16}
                  color="#6B7280"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.gridValue}>
                  {new Date(task.dueDate).toLocaleDateString("en-GB")}
                </Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Created By</Text>
              <Text style={[styles.gridValue, { marginLeft: 2 }]}>
                {task.createdByName}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Created On</Text>
              <Text style={[styles.gridValue, { marginLeft: 2 }]}>
                {new Date(task.createdAt).toLocaleDateString("en-GB")}
              </Text>
            </View>
          </View>
        </View>

        {/* Linked Record (If applicable) */}
        {task.linkedRecordName && (
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Linked Record
            </Text>
            <View style={styles.linkedBox}>
              <View style={styles.linkedIconBox}>
                <Package size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.linkedType}>
                  {task.linkedRecordType?.toUpperCase()}
                </Text>
                <Text style={styles.linkedName} numberOfLines={1}>
                  {task.linkedRecordName}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Manager Actions */}
        {task.status !== "cancelled" && task.status !== "completed" && (
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Manager Actions
            </Text>
            <Text style={styles.helperText}>
              Staff updates the task status. As a manager, you can cancel the
              task if needed.
            </Text>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowCancelModal(true)}
            >
              <Text style={styles.cancelBtnText}>Cancel Task</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Cancel Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontFamily: Fonts?.bold }]}>
                Cancel Task
              </Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Are you sure you want to cancel this task? Please provide a
              reason.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnOutline}
                onPress={() => setShowCancelModal(false)}
              >
                <Text style={styles.modalBtnOutlineText}>Keep Task</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtnDanger,
                  !cancelReason.trim() && { opacity: 0.5 },
                ]}
                onPress={handleCancelTask}
                disabled={!cancelReason.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalBtnDangerText}>Cancel Task</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { paddingBottom: 20 },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: { paddingRight: 8, paddingTop: 2 },
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

  scrollContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },

  taskTitle: { fontSize: 18, color: "#111827", marginBottom: 12 },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "600" },

  descSection: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 4,
  },
  sectionTitle: { fontSize: 16, color: "#111827", marginBottom: 12 },
  descText: { fontSize: 14, color: "#4B5563", lineHeight: 20 },

  gridInfo: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 16,
  },
  gridItem: { width: "50%", marginBottom: 16 },
  gridLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  gridValueRow: { flexDirection: "row", alignItems: "center" },
  gridValue: { fontSize: 14, fontWeight: "500", color: "#111827" },

  linkedBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  linkedIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  linkedType: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  linkedName: { fontSize: 14, fontWeight: "500", color: "#111827" },

  helperText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 20,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: { color: "#DC2626", fontWeight: "600", fontSize: 15 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "white", borderRadius: 16, padding: 20 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, color: "#111827" },
  modalDesc: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    height: 80,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtnOutline: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  modalBtnOutlineText: { color: "#374151", fontWeight: "600", fontSize: 15 },
  modalBtnDanger: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },
  modalBtnDangerText: { color: "white", fontWeight: "600", fontSize: 15 },
});

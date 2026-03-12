import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { TaskPriority, TaskType } from "@/services/taskService";
import { useTaskStore } from "@/store/useTaskStore";
import { useToastStore } from "@/store/useToastStore";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import {
    Calendar,
    ChevronLeft,
    Plus,
    User as UserIcon,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// 👇 NEW: Import the DatePicker
import DateTimePicker from "@react-native-community/datetimepicker";

export default function CreateTaskScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const { createTask, isLoading } = useTaskStore();
  const { users } = useUserStore();

  const assignableUsers = users.filter((u) => u.status !== "inactive");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  // 👇 NEW: Changed from String to Date object + Added toggle state
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [taskType, setTaskType] = useState<TaskType | "">("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!assignedTo) newErrors.assignedTo = "Please assign to a staff member";
    if (!dueDate) newErrors.dueDate = "Due date is required"; // Simplified validation!

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 👇 NEW: Handler for when a date is picked
  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Android auto-closes, iOS needs manual closing depending on display mode
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDueDate(selectedDate);
      setErrors({ ...errors, dueDate: "" });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        assignedTo,
        dueDate: dueDate!.toISOString(), // We know it exists because of validation
        priority: priority || undefined,
        taskType: taskType || undefined,
      });

      showToast("Task assigned successfully!", "success");
      router.back();
    } catch (error: any) {
      showToast(error.message || "Failed to assign task", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#F9FAFB" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
                <Plus size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Create Task
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Assign a new task to staff
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
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
            Task Details
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Title <Text style={{ color: "#DC2626" }}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.title && styles.inputError]}
              placeholder="e.g., Monthly Stock Count"
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                setErrors({ ...errors, title: "" });
              }}
            />
            {errors.title && (
              <Text style={styles.errorText}>{errors.title}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Description <Text style={{ color: "#DC2626" }}>*</Text>
            </Text>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Provide detailed instructions..."
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                setErrors({ ...errors, description: "" });
              }}
              multiline
              textAlignVertical="top"
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Assign To <Text style={{ color: "#DC2626" }}>*</Text>
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {assignableUsers.map((u) => (
                <TouchableOpacity
                  key={u._id}
                  style={[
                    styles.chip,
                    assignedTo === u._id && styles.chipActive,
                  ]}
                  onPress={() => {
                    setAssignedTo(u._id);
                    setErrors({ ...errors, assignedTo: "" });
                  }}
                >
                  <UserIcon
                    size={14}
                    color={assignedTo === u._id ? "#1D4ED8" : "#6B7280"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      assignedTo === u._id && styles.chipTextActive,
                    ]}
                  >
                    {u.fullName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {errors.assignedTo && (
              <Text style={styles.errorText}>{errors.assignedTo}</Text>
            )}
          </View>

          {/* 👇 NEW: Native Date Picker Trigger */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Due Date <Text style={{ color: "#DC2626" }}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                { paddingLeft: 44, justifyContent: "center" },
                errors.dueDate && styles.inputError,
              ]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Calendar size={20} color="#9CA3AF" style={styles.inputIcon} />
              <Text
                style={{ fontSize: 15, color: dueDate ? "#111827" : "#9CA3AF" }}
              >
                {dueDate
                  ? dueDate.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Select a due date"}
              </Text>
            </TouchableOpacity>
            {errors.dueDate && (
              <Text style={styles.errorText}>{errors.dueDate}</Text>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()} // Prevent selecting past dates
                onChange={handleDateChange}
              />
            )}
            {/* iOS often requires a button to dismiss the picker if not using a modal */}
            {Platform.OS === "ios" && showDatePicker && (
              <TouchableOpacity
                style={{ alignItems: "flex-end", marginTop: 8 }}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={{ color: "#2563EB", fontWeight: "bold" }}>
                  Done
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
            Additional Information
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Priority</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["low", "medium", "high"] as TaskPriority[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, priority === p && styles.chipActive]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      priority === p && styles.chipTextActive,
                    ]}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Task Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {(
                [
                  "inventory",
                  "procurement",
                  "expiry",
                  "stock-count",
                  "general",
                ] as TaskType[]
              ).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, taskType === t && styles.chipActive]}
                  onPress={() => setTaskType(t)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      taskType === t && styles.chipTextActive,
                    ]}
                  >
                    {t === "stock-count"
                      ? "Stock Count"
                      : t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Plus size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.submitBtnText, { fontFamily: Fonts?.bold }]}>
                Assign Task
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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

  scrollContent: { padding: 16, paddingBottom: 100 },
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
  sectionTitle: { fontSize: 16, color: "#111827", marginBottom: 16 },

  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    height: 100,
    backgroundColor: "#F9FAFB",
  },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },

  inputIconWrapper: { position: "relative", justifyContent: "center" },
  inputIcon: { position: "absolute", left: 12, zIndex: 1 },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "white",
  },
  chipActive: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  chipText: { fontSize: 14, color: "#4B5563" },
  chipTextActive: { color: "#2563EB", fontWeight: "600" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { color: "white", fontSize: 16 },
});

import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToastStore } from "@/store/useToastStore";
import { useUserStore } from "@/store/useUserStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    AlertTriangle,
    ChevronLeft,
    Lock,
    Mail,
    Save,
    Shield,
    User as UserIcon,
    UserX,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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

export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const { users, updateUser, deactivateUser, isLoading } = useUserStore();

  // Find the specific user from the store
  const userToEdit = users.find((u) => u._id === id);

  const [fullName, setFullName] = useState(userToEdit?.fullName || "");
  const [email, setEmail] = useState(userToEdit?.email || "");
  const [password, setPassword] = useState(""); // Keep empty unless changing
  const [role, setRole] = useState<"staff" | "owner">(
    (userToEdit?.role as "staff" | "owner") || "staff",
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // If user refreshes or accesses directly and store is empty, go back
    if (!userToEdit) {
      router.back();
    }
  }, [userToEdit]);

  if (!userToEdit) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const updateData: any = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
      };

      // Only send password if they actually typed a new one
      if (password) {
        updateData.password = password;
      }

      await updateUser(id, updateData);
      showToast("User updated successfully!", "success");
      router.back();
    } catch (error: any) {
      showToast(error.message || "Failed to update user", "error");
    }
  };

  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate User",
      `Are you sure you want to deactivate ${userToEdit.fullName}? They will no longer be able to log in.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              await deactivateUser(id);
              showToast("User deactivated", "success");
              router.back();
            } catch (error: any) {
              showToast(error.message || "Failed to deactivate user", "error");
            }
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#F9FAFB" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0D9488"
        translucent={false}
      />

      {/* Header - Teal 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#0D9488" }]}>
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
                <Edit3Icon size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Edit User
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  @{userToEdit.username}
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
        {/* Role Selection */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
            Account Role
          </Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                role === "staff"
                  ? styles.toggleBtnStaffActive
                  : styles.toggleBtnInactive,
              ]}
              onPress={() => setRole("staff")}
            >
              <UserIcon
                size={24}
                color={role === "staff" ? "#1D4ED8" : "#6B7280"}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: role === "staff" ? "#1D4ED8" : "#6B7280" },
                ]}
              >
                Staff
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                role === "owner"
                  ? styles.toggleBtnOwnerActive
                  : styles.toggleBtnInactive,
              ]}
              onPress={() => setRole("owner")}
            >
              <Shield
                size={24}
                color={role === "owner" ? "#7E22CE" : "#6B7280"}
              />
              <Text
                style={[
                  styles.toggleBtnText,
                  { color: role === "owner" ? "#7E22CE" : "#6B7280" },
                ]}
              >
                Owner
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Details Form */}
        <View style={styles.card}>
          <Text
            style={[
              styles.sectionTitle,
              { fontFamily: Fonts?.bold, marginBottom: 16 },
            ]}
          >
            User Details
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputIconWrapper}>
              <UserIcon size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  setErrors({ ...errors, fullName: "" });
                }}
              />
            </View>
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputIconWrapper}>
              <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(t) => {
                  setEmail(t);
                  setErrors({ ...errors, email: "" });
                }}
              />
            </View>
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Change Password (Optional)</Text>
            <View style={styles.inputIconWrapper}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Leave blank to keep current"
                value={password}
                secureTextEntry
                onChangeText={(t) => {
                  setPassword(t);
                  setErrors({ ...errors, password: "" });
                }}
              />
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>
        </View>

        {/* Danger Zone */}
        {userToEdit.status !== "inactive" && (
          <View style={styles.dangerZone}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <AlertTriangle
                size={20}
                color="#DC2626"
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: "#DC2626", marginBottom: 0 },
                ]}
              >
                Danger Zone
              </Text>
            </View>
            <Text style={styles.helperText}>
              Deactivating this user will prevent them from logging into the
              system.
            </Text>
            <TouchableOpacity
              style={styles.deactivateBtn}
              onPress={handleDeactivate}
              disabled={isLoading}
            >
              <UserX size={20} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={styles.deactivateBtnText}>Deactivate Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.submitBtnText, { fontFamily: Fonts?.bold }]}>
                Save Changes
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Just a quick wrapper to use the standard edit icon
const Edit3Icon = ({ size, color }: { size: number; color: string }) => {
  return <Save size={size} color={color} />;
};

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
  sectionTitle: { fontSize: 16, color: "#111827", marginBottom: 12 },

  toggleRow: { flexDirection: "row", gap: 12 },
  toggleBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
  },
  toggleBtnInactive: { borderColor: "#E5E7EB", backgroundColor: "white" },
  toggleBtnStaffActive: { borderColor: "#3B82F6", backgroundColor: "#EFF6FF" },
  toggleBtnOwnerActive: { borderColor: "#A855F7", backgroundColor: "#FAF5FF" },
  toggleBtnText: { marginTop: 8, fontSize: 14, fontWeight: "500" },

  helperText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 12,
  },

  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },

  inputIconWrapper: { position: "relative", justifyContent: "center" },
  inputIcon: { position: "absolute", left: 12, zIndex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    height: 48,
    paddingLeft: 40,
    paddingRight: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
  },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },

  dangerZone: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  deactivateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    height: 48,
    borderRadius: 8,
    marginTop: 8,
  },
  deactivateBtnText: { color: "#DC2626", fontSize: 15, fontWeight: "600" },

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
    backgroundColor: "#0D9488",
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { color: "white", fontSize: 16 },
});

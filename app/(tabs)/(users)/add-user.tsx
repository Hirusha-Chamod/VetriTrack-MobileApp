import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useToastStore } from "@/store/useToastStore";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import {
    ChevronLeft,
    Lock,
    Mail,
    Shield,
    User as UserIcon,
    UserPlus,
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

export default function AddUserScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const { createUser, isLoading } = useUserStore();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"staff" | "owner">("staff");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!username.trim()) newErrors.username = "Username is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createUser({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
        role,
      });

      showToast("User created successfully!", "success");
      router.back();
    } catch (error: any) {
      showToast(error.message || "Failed to create user", "error");
    }
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
                <UserPlus size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Add New User
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Create a new staff or owner account
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
        {/* Role Selection Card */}
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
          <Text style={styles.helperText}>
            {role === "owner"
              ? "Owners have full access to view analytics, approve POs, and manage users."
              : "Staff can manage inventory, receive stock, and create draft orders."}
          </Text>
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
            <Text style={styles.inputLabel}>
              Full Name <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.inputIconWrapper}>
              <UserIcon size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="e.g., Dr. Sarah Smith"
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
            <Text style={styles.inputLabel}>
              Username <Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { paddingLeft: 12 },
                errors.username && styles.inputError,
              ]}
              placeholder="sarah_vet"
              value={username}
              autoCapitalize="none"
              onChangeText={(t) => {
                setUsername(t);
                setErrors({ ...errors, username: "" });
              }}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Email Address <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.inputIconWrapper}>
              <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="sarah@clinic.com"
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
            <Text style={styles.inputLabel}>
              Password <Text style={styles.asterisk}>*</Text>
            </Text>
            <View style={styles.inputIconWrapper}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Minimum 6 characters"
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
      </ScrollView>

      {/* Bottom Action Bar */}
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
              <UserPlus size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.submitBtnText, { fontFamily: Fonts?.bold }]}>
                Create Account
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
  sectionTitle: { fontSize: 16, color: "#111827", marginBottom: 12 },

  toggleRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  toggleBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
  },
  toggleBtnInactive: { borderColor: "#E5E7EB", backgroundColor: "white" },
  toggleBtnStaffActive: { borderColor: "#3B82F6", backgroundColor: "#EFF6FF" }, // Blue
  toggleBtnOwnerActive: { borderColor: "#A855F7", backgroundColor: "#FAF5FF" }, // Purple
  toggleBtnText: { marginTop: 8, fontSize: 14, fontWeight: "500" },

  helperText: { fontSize: 13, color: "#6B7280", lineHeight: 18 },

  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  asterisk: { color: "#DC2626" },

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

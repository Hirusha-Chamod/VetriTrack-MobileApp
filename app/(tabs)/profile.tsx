import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { authApi, UserProfile } from "@/services/authService";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "expo-router";
import { Edit2, LogOut, Mail, User, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const showToast = useToastStore((state) => state.showToast);

  const colorScheme = "light";
  const theme = Colors[colorScheme];

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // --- EDIT PROFILE STATE ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await authApi.getUserById(user.id);
      setProfileData(data);
      setEditName(data.fullName || data.username); // Pre-fill name
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    logout();
  };

  const navigateToDashboard = () => {
    setShowDropdown(false);
    router.replace("/(tabs)");
  };

  // --- HANDLE SAVE UPDATES ---
  const handleSaveProfile = async () => {
    if (!user?.id) return;

    try {
      setIsSubmitting(true);
      const updates: any = {};

      if (editName.trim() && editName !== profileData?.fullName) {
        updates.fullName = editName.trim();
      }
      if (editPassword.trim()) {
        if (editPassword.length < 6) {
          showToast("Password must be at least 6 characters", "error");
          setIsSubmitting(false);
          return;
        }
        updates.password = editPassword;
      }

      // If nothing changed, just close the modal
      if (Object.keys(updates).length === 0) {
        setShowEditModal(false);
        setIsSubmitting(false);
        return;
      }

      await authApi.updateUser(user.id, updates);
      showToast("Profile updated successfully!", "success");

      // Reset form and refresh data
      setEditPassword("");
      setShowEditModal(false);
      await fetchProfile();
    } catch (error: any) {
      showToast(error.message || "Failed to update profile", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.primary}
        translucent={false}
      />
      <Header
        title="Profile"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/" as any)}
        onProfile={() => router.push("/profile" as any)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.profileCenter}>
                {/* Edit Button in Top Right */}
                <TouchableOpacity
                  style={styles.editIconBtn}
                  onPress={() => {
                    setEditName(profileData?.fullName || user?.username || "");
                    setEditPassword("");
                    setShowEditModal(true);
                  }}
                >
                  <Edit2 size={18} color={theme.primary} />
                </TouchableOpacity>

                <View
                  style={[
                    styles.avatarContainer,
                    { backgroundColor: theme.blue100 },
                  ]}
                >
                  <User size={40} color={theme.primary} strokeWidth={2} />
                </View>

                <Text
                  style={[
                    styles.nameText,
                    { color: theme.textPrimary, fontFamily: Fonts?.bold },
                  ]}
                >
                  {profileData?.fullName || user?.username}
                </Text>

                <View
                  style={[styles.roleBadge, { backgroundColor: theme.blue50 }]}
                >
                  <Text
                    style={[
                      styles.roleBadgeText,
                      { color: theme.blue700, fontFamily: Fonts?.sans },
                    ]}
                  >
                    {profileData?.role === "owner" ? "Owner" : "Staff Member"}
                  </Text>
                </View>

                <View style={styles.emailRow}>
                  <Mail size={16} color={theme.textSecondary} />
                  <Text
                    style={[
                      styles.emailText,
                      { color: theme.textSecondary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    {profileData?.email || "No email provided"}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.usernameText,
                    { color: theme.textMuted, fontFamily: Fonts?.sans },
                  ]}
                >
                  @{profileData?.username || user?.username}
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: theme.textPrimary, fontFamily: Fonts?.bold },
                ]}
              >
                Account Details
              </Text>

              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.textSecondary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    User ID
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.textPrimary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    {profileData?._id?.substring(0, 8).toUpperCase() ||
                      user?.id.substring(0, 8).toUpperCase()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.detailRow,
                    { borderTopColor: theme.border, borderTopWidth: 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.textSecondary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    Role
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      {
                        color: theme.textPrimary,
                        fontFamily: Fonts?.sans,
                        textTransform: "capitalize",
                      },
                    ]}
                  >
                    {profileData?.role || user?.role}
                  </Text>
                </View>
                <View
                  style={[
                    styles.detailRow,
                    { borderTopColor: theme.border, borderTopWidth: 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.detailLabel,
                      { color: theme.textSecondary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    Username
                  </Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: theme.textPrimary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    {profileData?.username || user?.username}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.logoutButton, { backgroundColor: theme.danger }]}
              onPress={() => setShowLogoutDialog(true)}
              activeOpacity={0.8}
            >
              <LogOut size={20} color="white" style={{ marginRight: 8 }} />
              <Text
                style={[styles.logoutButtonText, { fontFamily: Fonts?.bold }]}
              >
                Log Out
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* ─── EDIT PROFILE MODAL ─── */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.dialogOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ width: "100%" }}
          >
            <View
              style={[styles.dialogContent, { backgroundColor: theme.card }]}
            >
              <View style={styles.modalHeaderRow}>
                <Text
                  style={[
                    styles.dialogTitle,
                    {
                      color: theme.textPrimary,
                      fontFamily: Fonts?.bold,
                      marginBottom: 0,
                    },
                  ]}
                >
                  Edit Profile
                </Text>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
              />

              <Text style={styles.inputLabel}>New Password (Optional)</Text>
              <TextInput
                style={styles.input}
                value={editPassword}
                onChangeText={setEditPassword}
                placeholder="Leave blank to keep current"
                secureTextEntry
              />

              <View style={[styles.dialogFooter, { marginTop: 16 }]}>
                <TouchableOpacity
                  style={[
                    styles.dialogBtn,
                    { borderColor: theme.border, borderWidth: 1 },
                  ]}
                  onPress={() => setShowEditModal(false)}
                  disabled={isSubmitting}
                >
                  <Text
                    style={[
                      styles.dialogBtnText,
                      { color: theme.textPrimary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.dialogBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSaveProfile}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text
                      style={[
                        styles.dialogBtnText,
                        { color: "white", fontFamily: Fonts?.bold },
                      ]}
                    >
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ─── LOGOUT DIALOG ─── */}
      <Modal visible={showLogoutDialog} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogContent, { backgroundColor: theme.card }]}>
            <Text
              style={[
                styles.dialogTitle,
                { color: theme.textPrimary, fontFamily: Fonts?.bold },
              ]}
            >
              Log out?
            </Text>
            <Text
              style={[
                styles.dialogDescription,
                { color: theme.textSecondary, fontFamily: Fonts?.sans },
              ]}
            >
              Are you sure you want to log out of VetriTrack?
            </Text>
            <View style={styles.dialogFooter}>
              <TouchableOpacity
                style={[
                  styles.dialogBtn,
                  { borderColor: theme.border, borderWidth: 1 },
                ]}
                onPress={() => setShowLogoutDialog(false)}
              >
                <Text
                  style={[
                    styles.dialogBtnText,
                    { color: theme.textPrimary, fontFamily: Fonts?.sans },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, { backgroundColor: theme.danger }]}
                onPress={handleLogoutConfirm}
              >
                <Text
                  style={[
                    styles.dialogBtnText,
                    { color: "white", fontFamily: Fonts?.bold },
                  ]}
                >
                  Log Out
                </Text>
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
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },

  card: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: "relative", // needed for absolute edit button
  },

  editIconBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    zIndex: 10,
  },

  profileCenter: { alignItems: "center", padding: 24, paddingTop: 32 },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  nameText: { fontSize: 20, marginBottom: 4 },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 8,
  },
  roleBadgeText: { fontSize: 14 },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  emailText: { fontSize: 14 },
  usernameText: { fontSize: 14, marginTop: 4 },

  sectionTitle: { fontSize: 16, padding: 16, paddingBottom: 8 },
  detailsList: { paddingHorizontal: 16, paddingBottom: 8 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14 },

  logoutButton: {
    flexDirection: "row",
    height: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  logoutButtonText: { color: "white", fontSize: 16 },

  // Dialog & Modal Styles
  dialogOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialogContent: { width: "100%", borderRadius: 12, padding: 24 },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  dialogTitle: { fontSize: 18, marginBottom: 8 },
  dialogDescription: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  dialogFooter: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  dialogBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: "center",
  },
  dialogBtnText: { fontSize: 14 },

  // Edit form styles
  inputLabel: {
    fontSize: 13,
    color: "#4B5563",
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#111827",
  },
});

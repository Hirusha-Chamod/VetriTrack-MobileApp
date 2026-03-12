import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSupplierStore } from "@/store/useSupplierStore";
import { useToastStore } from "@/store/useToastStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Building2,
    ChevronLeft,
    Clock,
    Edit,
    Info,
    Mail,
    Save,
    X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

export default function SupplierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { suppliers, updateSupplier, isLoading } = useSupplierStore();
  const showToast = useToastStore((state) => state.showToast);

  // Find the current supplier from the store
  const supplier = suppliers.find((s) => s._id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: "",
    status: "Active" as "Active" | "Inactive",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Initialize form data when supplier is loaded
  useEffect(() => {
    if (supplier) {
      setFormData({
        supplierName: supplier.supplierName || "",
        status: supplier.status || "Active",
        contactName: supplier.contactName || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        notes: supplier.notes || "",
      });
    }
  }, [supplier]);

  if (!supplier) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color="#0891B2" />
      </View>
    );
  }

  const handleSave = async () => {
    try {
      await updateSupplier(id, formData);
      setIsEditing(false);
      showToast("Supplier details updated successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update supplier", "error");
    }
  };

  const handleCancel = () => {
    // Reset to original data
    setFormData({
      supplierName: supplier.supplierName || "",
      status: supplier.status || "Active",
      contactName: supplier.contactName || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setIsEditing(false);
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    multiline = false,
    icon?: any,
  ) => (
    <View style={styles.inputGroup}>
      <Text
        style={[
          styles.label,
          { color: theme.textPrimary, fontFamily: Fonts?.sans },
        ]}
      >
        {label}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          { color: theme.textPrimary, fontFamily: Fonts?.sans },
          !isEditing && {
            backgroundColor: "#F9FAFB",
            borderColor: "transparent",
            color: "#4B5563",
          },
        ]}
        value={formData[field]}
        onChangeText={(text) =>
          setFormData({ ...formData, [field]: text as any })
        }
        editable={isEditing}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        placeholder={isEditing ? `Enter ${label.toLowerCase()}` : ""}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#F9FAFB" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0891B2" />
      <Header
        title="Supplier Details"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/" as any)}
        onProfile={() => router.push("/profile" as any)}
      />

      {/* Header */}
      <View style={[styles.headerWrapper, { backgroundColor: "#0891B2" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerTitleGroup}>
              <Building2 size={24} color="white" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}
                  numberOfLines={1}
                >
                  {supplier.supplierName}
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Supplier Details
                </Text>
              </View>
            </View>

            {!isEditing && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setIsEditing(true)}
              >
                <Edit size={14} color="#0891B2" />
                <Text style={[styles.editBtnText, { fontFamily: Fonts?.bold }]}>
                  Edit
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Supplier Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Building2 size={20} color="#0891B2" />
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              Supplier Information
            </Text>
          </View>
          <View style={styles.cardBody}>
            {renderInput("Supplier Name", "supplierName")}

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: theme.textPrimary, fontFamily: Fonts?.sans },
                ]}
              >
                Status
              </Text>
              {isEditing ? (
                <View style={styles.statusToggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      formData.status === "Active"
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, status: "Active" })
                    }
                  >
                    <Text
                      style={[
                        styles.statusToggleText,
                        formData.status === "Active" && {
                          color: "#15803D",
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      formData.status === "Inactive"
                        ? styles.statusActive
                        : styles.statusInactive,
                    ]}
                    onPress={() =>
                      setFormData({ ...formData, status: "Inactive" })
                    }
                  >
                    <Text
                      style={[
                        styles.statusToggleText,
                        formData.status === "Inactive" && {
                          color: "#374151",
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.readOnlyStatus}>
                  <Text
                    style={{
                      color:
                        formData.status === "Active" ? "#15803D" : "#4B5563",
                      fontWeight: "600",
                    }}
                  >
                    {formData.status}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Contact Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Mail size={20} color="#2563EB" />
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              Contact Details
            </Text>
          </View>
          <View style={styles.cardBody}>
            {renderInput("Contact Name", "contactName")}
            {renderInput("Email", "email")}
            {renderInput("Phone", "phone")}
            {renderInput("Address", "address")}
            {renderInput("Notes", "notes", true)}

            {supplier.updatedAt && (
              <Text style={styles.lastUpdatedText}>
                Last updated:{" "}
                {new Date(supplier.updatedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            )}
          </View>
        </View>

        {/* Lead Time Card (Read Only) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: "#EFF6FF",
              borderColor: "#BFDBFE",
              borderWidth: 1,
            },
          ]}
        >
          <View style={[styles.cardHeader, { borderBottomColor: "#DBEAFE" }]}>
            <Clock size={20} color="#2563EB" />
            <Text
              style={[
                styles.cardTitle,
                { fontFamily: Fonts?.bold, color: "#1E3A8A" },
              ]}
            >
              Lead Time (System-Calculated)
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: "#1E40AF", fontFamily: Fonts?.sans },
                ]}
              >
                Average Lead Time
              </Text>
              <View style={styles.leadTimeInputBox}>
                <Text style={styles.leadTimeValue}>
                  {supplier.leadTimeNotes || "N/A"}
                </Text>
                <View style={styles.readOnlyBadge}>
                  <Text style={styles.readOnlyBadgeText}>Read-Only</Text>
                </View>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Info size={16} color="#1D4ED8" style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.infoBoxTitle}>
                  Calculated automatically from PO history
                </Text>
                <Text style={styles.infoBoxDesc}>
                  Based on "Sent Date" to "Received Date" for completed receipts
                  from this supplier.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: theme.success }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Save size={18} color="white" style={{ marginRight: 8 }} />
                  <Text
                    style={[styles.btnTextPrimary, { fontFamily: Fonts?.bold }]}
                  >
                    Save Changes
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnOutline, { borderColor: theme.border }]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <X
                size={18}
                color={theme.textPrimary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.btnTextOutline,
                  { color: theme.textPrimary, fontFamily: Fonts?.bold },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  backBtn: { padding: 8, marginRight: 4 },
  headerTitleGroup: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 20, color: "white" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  editBtn: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  editBtnText: { color: "#0891B2", fontSize: 14 },

  scrollContent: { padding: 16, paddingBottom: 60 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 8,
  },
  cardTitle: { fontSize: 16, color: "#111827" },
  cardBody: { padding: 16 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, color: "#4B5563" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 15,
    backgroundColor: "white",
  },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 12 },

  statusToggleRow: { flexDirection: "row", gap: 8 },
  statusToggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusActive: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  statusInactive: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
  statusToggleText: { fontSize: 14, color: "#6B7280" },
  readOnlyStatus: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "center",
    borderRadius: 8,
  },

  lastUpdatedText: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  leadTimeInputBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  leadTimeValue: { fontSize: 16, fontWeight: "600", color: "#1E3A8A" },
  readOnlyBadge: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  readOnlyBadgeText: { color: "white", fontSize: 10, fontWeight: "bold" },

  infoBox: {
    flexDirection: "row",
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoBoxTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 2,
  },
  infoBoxDesc: { fontSize: 12, color: "#1D4ED8", lineHeight: 18 },

  actionRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  btnPrimary: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnTextPrimary: { color: "white", fontSize: 15 },
  btnOutline: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  btnTextOutline: { fontSize: 15 },
});

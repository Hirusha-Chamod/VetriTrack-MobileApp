import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSupplierStore } from "@/store/useSupplierStore";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "expo-router";
import { Building2, Save, X } from "lucide-react-native";
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

export default function AddSupplierScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { createSupplier, isLoading } = useSupplierStore();
  const showToast = useToastStore((state) => state.showToast);

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    phone: "",
    address: "",
    status: "Active" as "Active" | "Inactive",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Supplier name is required";
    if (!formData.contact.trim())
      newErrors.contact = "Contact name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await createSupplier({
        supplierName: formData.name,
        contactName: formData.contact,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        notes: formData.notes,
      });
      showToast("Supplier added successfully!", "success");
      router.back();
    } catch (error: any) {
      showToast(error.message || "Failed to add supplier", "error");
    }
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    multiline = false,
    keyboardType: any = "default",
  ) => (
    <View style={styles.inputGroup}>
      <Text
        style={[
          styles.label,
          { color: theme.textPrimary, fontFamily: Fonts?.sans },
        ]}
      >
        {label}{" "}
        {field !== "phone" && field !== "notes" && field !== "status" && (
          <Text style={{ color: theme.danger }}>*</Text>
        )}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          errors[field] && { borderColor: theme.danger },
          { color: theme.textPrimary, fontFamily: Fonts?.sans },
        ]}
        value={formData[field]}
        onChangeText={(text) => {
          setFormData({ ...formData, [field]: text });
          if (errors[field]) setErrors({ ...errors, [field]: "" });
        }}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
        autoCapitalize={field === "email" ? "none" : "words"}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#F9FAFB" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0891B2" />
      <Header
        title="Add Supplier"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/" as any)}
        onProfile={() => router.push("/profile" as any)}
      />

      {/* Header - Cyan 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#0891B2" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Building2 size={32} color="white" />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Add New Supplier
              </Text>
              <Text
                style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
              >
                Create a new supplier record
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Supplier Info Card */}
        <View style={styles.card}>
          <Text
            style={[
              styles.cardTitle,
              { fontFamily: Fonts?.bold, color: "#111827" },
            ]}
          >
            Supplier Information
          </Text>
          <View style={styles.cardBody}>
            {renderInput("Supplier Name", "name", "e.g., VetMed Supply Co.")}

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.label,
                  { color: theme.textPrimary, fontFamily: Fonts?.sans },
                ]}
              >
                Status
              </Text>
              <View style={styles.statusToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.statusToggleBtn,
                    formData.status === "Active"
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}
                  onPress={() => setFormData({ ...formData, status: "Active" })}
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
            </View>
          </View>
        </View>

        {/* Contact Details Card */}
        <View style={styles.card}>
          <Text
            style={[
              styles.cardTitle,
              { fontFamily: Fonts?.bold, color: "#111827" },
            ]}
          >
            Contact Details
          </Text>
          <View style={styles.cardBody}>
            {renderInput("Contact Name", "contact", "e.g., Sunil Perera")}
            {renderInput(
              "Email",
              "email",
              "e.g., orders@supplier.com",
              false,
              "email-address",
            )}
            {renderInput(
              "Phone",
              "phone",
              "e.g., +94 11 234 5678",
              false,
              "phone-pad",
            )}
            {renderInput("Address", "address", "e.g., Colombo 03, Sri Lanka")}
            {renderInput(
              "Notes",
              "notes",
              "Optional notes about this supplier",
              true,
            )}
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxTitle}>Note about Lead Time</Text>
          <Text style={styles.infoBoxDesc}>
            Lead time will be calculated automatically as you receive orders
            from this supplier.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: theme.success }]}
            onPress={handleSubmit}
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
                  Add Supplier
                </Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnOutline, { borderColor: theme.border }]}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <X size={18} color={theme.textPrimary} style={{ marginRight: 8 }} />
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerWrapper: { paddingBottom: 20 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: { fontSize: 22, color: "white", marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },

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
  cardTitle: {
    fontSize: 16,
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardBody: { padding: 16 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 8, color: "#4B5563" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    backgroundColor: "white",
  },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 12 },
  errorText: { color: "#DC2626", fontSize: 12, marginTop: 4 },

  statusToggleRow: { flexDirection: "row", gap: 8 },
  statusToggleBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  statusActive: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  statusInactive: { backgroundColor: "#F3F4F6", borderColor: "#E5E7EB" },
  statusToggleText: { fontSize: 14, color: "#6B7280" },

  infoBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 16,
    marginTop: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  infoBoxDesc: { fontSize: 12, color: "#1D4ED8", lineHeight: 18 },

  actionRow: { flexDirection: "row", gap: 12 },
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

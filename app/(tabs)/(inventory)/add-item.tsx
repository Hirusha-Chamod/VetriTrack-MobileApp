import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "expo-router";
import { ChevronDown, Package, Save, X } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export default function AddInventoryItemScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const colorScheme = 'light';
  const theme = Colors[colorScheme];
  const { createItem, isLoading } = useInventoryStore();
  const showToast = useToastStore((state) => state.showToast);

  const [formData, setFormData] = useState({
    itemCode: "",
    itemName: "",
    category: "",
    unitOfMeasure: "",
    minStockLevel: "",
    unitPrice: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activePicker, setActivePicker] = useState<{
    field: string;
    options: string[];
  } | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.itemCode.trim()) newErrors.itemCode = "Item code is required";
    if (!formData.itemName.trim()) newErrors.itemName = "Item name is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.unitOfMeasure)
      newErrors.unitOfMeasure = "Unit of measure is required";
    if (!formData.minStockLevel || parseInt(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = "Reorder point must be a positive number";
    }
    if (!formData.unitPrice || parseFloat(formData.unitPrice) < 0) {
      newErrors.unitPrice = "Price must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      await createItem({
        itemCode: formData.itemCode,
        itemName: formData.itemName,
        category: formData.category,
        unitOfMeasure: formData.unitOfMeasure,
        minStockLevel: parseInt(formData.minStockLevel),
        unitPrice: parseFloat(formData.unitPrice),
        notes: formData.notes,
      });

      showToast("Inventory item added successfully!", "success");

      setFormData({
        itemCode: "",
        itemName: "",
        category: "",
        unitOfMeasure: "",
        minStockLevel: "",
        unitPrice: "",
        notes: "",
      });
      setErrors({});

      router.back();
    } catch (error: any) {
      showToast(error.message || "Failed to create item", "error");
    }
  };

  const SelectField = ({ label, field, value, options }: any) => (
    <View style={styles.inputGroup}>
      <Text
        style={[
          styles.label,
          { color: theme.textPrimary, fontFamily: Fonts?.bold },
        ]}
      >
        {label} *
      </Text>
      <TouchableOpacity
        style={[
          styles.input,
          styles.selectTrigger,
          {
            backgroundColor: theme.white,
            borderColor: errors[field] ? theme.danger : theme.border,
          },
        ]}
        onPress={() => setActivePicker({ field, options })}
      >
        <Text
          style={{
            color: value ? theme.textPrimary : theme.textMuted,
            fontFamily: Fonts?.sans,
          }}
        >
          {value || `Select ${label.toLowerCase()}`}
        </Text>
        <ChevronDown size={18} color={theme.icon} />
      </TouchableOpacity>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0891B2" />
      <Header
        title="Add Item"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/" as any)}
        onProfile={() => router.push("/profile" as any)}
      />

      {/* Header - Matches Figma Cyan Style */}
      <View style={[styles.headerWrapper, { backgroundColor: "#0891B2" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Package size={32} color="white" />
            <View>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Add Inventory Item
              </Text>
              <Text
                style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
              >
                Create new item master data
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Master Data Section */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text
            style={[
              styles.cardTitle,
              { color: theme.textPrimary, fontFamily: Fonts?.bold },
            ]}
          >
            Item Master Data
          </Text>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textPrimary, fontFamily: Fonts?.bold },
              ]}
            >
              Item Code *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.white,
                  borderColor: errors.itemCode ? theme.danger : theme.border,
                  color: theme.textPrimary,
                },
              ]}
              placeholder="e.g., VAC-001"
              value={formData.itemCode}
              onChangeText={(t) => setFormData({ ...formData, itemCode: t })}
            />
            {errors.itemCode && (
              <Text style={styles.errorText}>{errors.itemCode}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textPrimary, fontFamily: Fonts?.bold },
              ]}
            >
              Item Name *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.white,
                  borderColor: errors.itemName ? theme.danger : theme.border,
                  color: theme.textPrimary,
                },
              ]}
              placeholder="e.g., Rabies Vaccine (Dog)"
              value={formData.itemName}
              onChangeText={(t) => setFormData({ ...formData, itemName: t })}
            />
            {errors.itemName && (
              <Text style={styles.errorText}>{errors.itemName}</Text>
            )}
          </View>

          <SelectField
            label="Category"
            field="category"
            value={formData.category}
            options={[
              "Vaccine",
              "Medication",
              "Supplement",
              "Treatment",
              "Surgical",
              "Diagnostic",
            ]}
          />
          <SelectField
            label="Unit of Measure"
            field="unitOfMeasure"
            value={formData.unitOfMeasure}
            options={[
              "vials",
              "bottles",
              "doses",
              "units",
              "tablets",
              "capsules",
              "packs",
              "boxes",
            ]}
          />

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textPrimary, fontFamily: Fonts?.bold },
              ]}
            >
              Unit Price (LKR) *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.white,
                  borderColor: errors.unitPrice ? theme.danger : theme.border,
                  color: theme.textPrimary,
                },
              ]}
              placeholder="e.g., 850"
              keyboardType="numeric"
              value={formData.unitPrice}
              onChangeText={(t) => setFormData({ ...formData, unitPrice: t })}
            />
            {errors.unitPrice && (
              <Text style={styles.errorText}>{errors.unitPrice}</Text>
            )}
          </View>
        </View>

        {/* Reorder Settings Section */}
        <View style={[styles.card, { backgroundColor: theme.white }]}>
          <Text
            style={[
              styles.cardTitle,
              { color: theme.textPrimary, fontFamily: Fonts?.bold },
            ]}
          >
            Reorder / Low Stock Settings
          </Text>
          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textPrimary, fontFamily: Fonts?.bold },
              ]}
            >
              Reorder Point / Minimum Stock Level *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.white,
                  borderColor: errors.minStockLevel
                    ? theme.danger
                    : theme.border,
                  color: theme.textPrimary,
                },
              ]}
              placeholder="e.g., 10"
              keyboardType="numeric"
              value={formData.minStockLevel}
              onChangeText={(t) =>
                setFormData({ ...formData, minStockLevel: t })
              }
            />
            <Text
              style={[
                styles.helperText,
                { color: theme.textSecondary, fontFamily: Fonts?.sans },
              ]}
            >
              Used for Low Stock Alerts when On Hand drops below this level.
            </Text>
            {errors.minStockLevel && (
              <Text style={styles.errorText}>{errors.minStockLevel}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text
              style={[
                styles.label,
                { color: theme.textPrimary, fontFamily: Fonts?.bold },
              ]}
            >
              Notes
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: theme.white,
                  borderColor: theme.border,
                  color: theme.textPrimary,
                },
              ]}
              placeholder="Optional notes about this item"
              multiline
              numberOfLines={3}
              value={formData.notes}
              onChangeText={(t) => setFormData({ ...formData, notes: t })}
            />
          </View>
        </View>

        {/* Action Buttons - Positions flipped to match Figma (Save Left, Cancel Right) */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.btn,
              styles.btnSave,
              { backgroundColor: theme.success },
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={20} color="white" />
                <Text style={[styles.btnText, { color: "white" }]}>
                  Save Item
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnCancel]}
            onPress={() => router.back()}
          >
            <X size={20} color={theme.textPrimary} />
            <Text style={[styles.btnText, { color: theme.textPrimary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Dropdown Picker */}
      <Modal visible={!!activePicker} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setActivePicker(null)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.pickerCard, { backgroundColor: theme.card }]}>
              <Text
                style={[
                  styles.pickerTitle,
                  { color: theme.textPrimary, fontFamily: Fonts?.bold },
                ]}
              >
                Select{" "}
                {activePicker?.field === "unitOfMeasure" ? "Unit" : "Category"}
              </Text>
              {activePicker?.options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.pickerOption,
                    { borderBottomColor: theme.border },
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, [activePicker.field]: opt });
                    if (errors[activePicker.field])
                      setErrors({ ...errors, [activePicker.field]: "" });
                    setActivePicker(null);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      { color: theme.textPrimary },
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { paddingBottom: 24 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 16,
  },
  headerTitle: { color: "white", fontSize: 22 },
  headerSubtitle: { color: "white", opacity: 0.8, fontSize: 14 },
  scrollContent: { padding: 16, paddingBottom: 60 },
  card: {
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardTitle: { fontSize: 16, marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textArea: { height: 80, textAlignVertical: "top", paddingTop: 12 },
  helperText: { fontSize: 12, marginTop: 6 },
  errorText: { color: "#DC2626", fontSize: 12, marginTop: 4 },
  actionRow: { flexDirection: "row", gap: 12 },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnCancel: { backgroundColor: "#E2E8F0" },
  btnSave: { elevation: 2 },
  btnText: { fontSize: 16, fontWeight: "600" },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  pickerCard: {
    width: "100%",
    borderRadius: 12,
    padding: 16,
    maxHeight: "70%",
  },
  pickerTitle: { fontSize: 18, marginBottom: 16, textAlign: "center" },
  pickerOption: { paddingVertical: 15, borderBottomWidth: 1 },
  pickerOptionText: { fontSize: 16, textAlign: "center" },
});

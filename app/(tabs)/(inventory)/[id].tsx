import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { inventoryApi, StockBatch } from "@/services/inventoryService";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useToastStore } from "@/store/useToastStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    AlertTriangle,
    ChevronLeft,
    Edit,
    Package,
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

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = 'light';
  const showToast = useToastStore((state) => state.showToast);

  const { items, updateItem, isLoading } = useInventoryStore();
  const item = items.find((i) => i._id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [batches, setBatches] = useState<StockBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);

  // Form State
  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("");
  const [minStockLevel, setMinStockLevel] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  useEffect(() => {
    if (item) {
      resetForm();
      fetchBatches();
    }
  }, [item]);

  const fetchBatches = async () => {
    try {
      const data = await inventoryApi.getItemBatches(id);
      setBatches(data);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    } finally {
      setLoadingBatches(false);
    }
  };

  const resetForm = () => {
    if (!item) return;
    setItemName(item.itemName);
    setCategory(item.category);
    setUnitOfMeasure(item.unitOfMeasure);
    setMinStockLevel(item.minStockLevel.toString());
    setUnitPrice(item.unitPrice.toString());
    setIsEditing(false);
  };

  if (!item) return null;

  const handleSave = async () => {
    try {
      await updateItem(id, {
        itemName,
        category,
        unitOfMeasure,
        minStockLevel: parseInt(minStockLevel, 10),
        unitPrice: parseFloat(unitPrice),
      });
      showToast("Item updated successfully!", "success");
      setIsEditing(false);
    } catch (error: any) {
      showToast(error.message || "Failed to update item", "error");
    }
  };

  const currentStock = item.currentStock || 0;

  const getStockStatus = () => {
    if (currentStock <= item.minStockLevel * 0.5)
      return { label: "Critical", bg: "#FEE2E2", text: "#B91C1C" };
    if (currentStock <= item.minStockLevel)
      return { label: "Low Stock", bg: "#FFEDD5", text: "#C2410C" };
    return { label: "In Stock", bg: "#DCFCE7", text: "#15803D" };
  };
  const status = getStockStatus();

  const CATEGORIES = [
    "Vaccine",
    "Medication",
    "Supplement",
    "Treatment",
    "Surgical",
    "Diagnostic",
  ];
  const UNITS = [
    "vials",
    "bottles",
    "doses",
    "units",
    "tablets",
    "capsules",
    "packs",
    "boxes",
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#F9FAFB" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#374151"
        translucent={false}
      />

      {/* Header - Gray 700 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#374151" }]}>
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
                <Package size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}
                  numberOfLines={1}
                >
                  {item.itemName}
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {item.itemCode}
                </Text>
              </View>
            </View>

            {!isEditing && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => setIsEditing(true)}
              >
                <Edit size={16} color="#374151" style={{ marginRight: 4 }} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stock Summary */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
            Stock Summary
          </Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Current Stock</Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text style={styles.summaryValue}>{currentStock}</Text>
                <Text style={styles.summaryUnit}>{item.unitOfMeasure}</Text>
              </View>
            </View>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Status</Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: status.bg,
                    alignSelf: "flex-start",
                    marginTop: 4,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: status.text }]}>
                  {status.label}
                </Text>
              </View>
            </View>
          </View>

          {currentStock <= item.minStockLevel && (
            <View style={styles.alertBox}>
              <AlertTriangle
                size={16}
                color="#C2410C"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <Text style={styles.alertText}>
                Stock is below reorder point ({item.minStockLevel}{" "}
                {item.unitOfMeasure}). Consider reordering.
              </Text>
            </View>
          )}
        </View>

        {/* Master Data */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
            Item Master Data
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Item Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={itemName}
              onChangeText={setItemName}
              editable={isEditing}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category</Text>
            {isEditing ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.chip, category === c && styles.chipActive]}
                    onPress={() => setCategory(c)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        category === c && styles.chipTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={category}
                editable={false}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Unit of Measure</Text>
            {isEditing ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {UNITS.map((u) => (
                  <TouchableOpacity
                    key={u}
                    style={[
                      styles.chip,
                      unitOfMeasure === u && styles.chipActive,
                    ]}
                    onPress={() => setUnitOfMeasure(u)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        unitOfMeasure === u && styles.chipTextActive,
                      ]}
                    >
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={unitOfMeasure}
                editable={false}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Unit Price (LKR)</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={unitPrice}
              onChangeText={setUnitPrice}
              editable={isEditing}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        {/* Reorder Settings */}
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
          <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
            Reorder Settings
          </Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Minimum Stock Level</Text>
            <TextInput
              style={[
                styles.input,
                !isEditing && styles.inputDisabled,
                { backgroundColor: isEditing ? "white" : "#F9FAFB" },
              ]}
              value={minStockLevel}
              onChangeText={setMinStockLevel}
              editable={isEditing}
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              Used for Low Stock Alerts and reorder monitoring.
            </Text>
          </View>
        </View>

        {/* Batch Info */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
            Batch Information
          </Text>
          {loadingBatches ? (
            <ActivityIndicator
              size="small"
              color="#374151"
              style={{ alignSelf: "flex-start" }}
            />
          ) : batches.length > 0 ? (
            <View>
              <Text
                style={{
                  fontSize: 14,
                  color: "#374151",
                  fontWeight: "500",
                  marginBottom: 4,
                }}
              >
                {batches.length} active batch(es)
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280" }}>
                View batch details in Expiry Management
              </Text>
            </View>
          ) : (
            <Text style={{ fontSize: 14, color: "#6B7280" }}>
              No active batches
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Editing Action Bar */}
      {isEditing && (
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
            <X size={20} color="#374151" style={{ marginRight: 6 }} />
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={20} color="white" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Save</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerTitle: {
    fontSize: 20,
    color: "white",
    marginBottom: 2,
    paddingRight: 10,
  },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  editBtn: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editBtnText: { color: "#374151", fontSize: 13, fontWeight: "600" },

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

  summaryGrid: { flexDirection: "row", marginBottom: 12 },
  summaryCol: { flex: 1 },
  summaryLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  summaryValue: { fontSize: 28, fontWeight: "bold", color: "#111827" },
  summaryUnit: { fontSize: 14, color: "#6B7280", marginLeft: 4 },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: "600" },

  alertBox: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  alertText: { flex: 1, color: "#9A3412", fontSize: 13, lineHeight: 18 },

  inputGroup: { marginBottom: 16 },
  inputLabel: {
    fontSize: 13,
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
    backgroundColor: "white",
  },
  inputDisabled: { backgroundColor: "#F3F4F6", color: "#6B7280" },
  helperText: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
  },
  chipActive: { backgroundColor: "#374151", borderColor: "#374151" },
  chipText: { fontSize: 14, color: "#4B5563" },
  chipTextActive: { color: "white", fontWeight: "600" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtnText: { color: "#374151", fontSize: 15, fontWeight: "600" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#16A34A",
    height: 48,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: { color: "white", fontSize: 15, fontWeight: "600" },
});

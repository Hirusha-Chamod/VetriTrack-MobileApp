import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useToastStore } from "@/store/useToastStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  FileText,
  Minus,
  Package,
  Plus,
  Search,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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

const ADJUSTMENT_REASONS = [
  { id: "expired-disposed", label: "Expired / Disposed" },
  { id: "damaged", label: "Damaged" },
  { id: "lost", label: "Lost / Theft" },
  { id: "count-correction", label: "Count Correction" },
  { id: "transfer", label: "Transfer" },
  { id: "other", label: "Other" },
];

export default function StockAdjustmentScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const params = useLocalSearchParams();

  const { items, fetchItems } = useInventoryStore();
  const { processTransaction, isLoading } = useTransactionStore();

  const [selectedItemId, setSelectedItemId] = useState<string>(
    (params.prefillItemId as string) || "",
  );
  const [adjustmentType, setAdjustmentType] = useState<"add" | "remove">(
    (params.prefillType as "add" | "remove") || "remove",
  );
  const [quantity, setQuantity] = useState<string>(
    (params.prefillQty as string) || "1",
  );
  const [reason, setReason] = useState<string>(
    (params.prefillReason as string) || "count-correction",
  );
  const [notes, setNotes] = useState<string>(
    (params.prefillNotes as string) || "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [targetBatchId, setTargetBatchId] = useState<string | undefined>(
    (params.prefillBatchId as string) || undefined,
  );

  useEffect(() => {
    if (items.length === 0) fetchItems();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedItem = items.find((i) => i._id === selectedItemId);

  const handleAdjustmentSubmit = async () => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }

    // Prevent Negative Stock on Remove
    if (adjustmentType === "remove") {
      const currentStock = selectedItem?.currentStock || 0;
      if (qty > currentStock) {
        showToast(
          `Cannot remove ${qty}. Only ${currentStock} in stock.`,
          "error",
        );
        return;
      }
    }

    try {
      const finalQuantity =
        adjustmentType === "remove" ? -Math.abs(qty) : Math.abs(qty);

      const reasonLabel =
        ADJUSTMENT_REASONS.find((r) => r.id === reason)?.label || reason;
      const fullReason = notes ? `${reasonLabel} - ${notes}` : reasonLabel;

      await processTransaction({
        itemId: selectedItemId,
        batchId: targetBatchId, // This might be undefined, but backend Auto-Pilot will handle it!
        type: "ADJUSTMENT",
        quantity: finalQuantity,
        reason: fullReason,
      });

      showToast("Stock adjusted successfully!", "success");

      // 👇 CLEAR ALL STATE BEFORE LEAVING 👇
      setSelectedItemId("");
      setTargetBatchId(undefined);
      setSearchQuery("");
      setQuantity("1");
      setAdjustmentType("remove");
      setReason("count-correction");
      setNotes("");

      // Go back to the hub
      router.back();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to adjust stock";
      const finalMessage = Array.isArray(errorMessage)
        ? errorMessage[0]
        : errorMessage;
      showToast(finalMessage, "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#F9FAFB" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#EA580C"
        translucent={false}
      />

      {/* Header - Orange 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#EA580C" }]}>
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
                <Edit3 size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Stock Adjustment
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Record inventory corrections
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentPad}>
        {!selectedItemId ? (
          /* STEP 1: Select Item */
          <>
            <View style={styles.searchContainer}>
              <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search items to adjust..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => setSelectedItemId(item._id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}
                    >
                      {item.itemName}
                    </Text>
                    <Text style={styles.cardSub}>
                      Current Stock: {item.currentStock || 0}{" "}
                      {item.unitOfMeasure}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            />
          </>
        ) : (
          /* STEP 2: Adjustment Details */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Selected Item Context */}
            <View style={styles.selectedContextCard}>
              <View style={styles.contextRow}>
                <Package
                  size={20}
                  color="#EA580C"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.contextLabel}>Selected Item</Text>
                  <Text
                    style={[styles.contextValue, { fontFamily: Fonts?.bold }]}
                  >
                    {selectedItem?.itemName}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#4B5563", marginTop: 2 }}
                  >
                    Current Stock: {selectedItem?.currentStock || 0}{" "}
                    {selectedItem?.unitOfMeasure}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedItemId("");
                    setTargetBatchId(undefined);
                  }}
                  style={styles.changeBtn}
                >
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Adjustment Type Toggle */}
            <View style={styles.detailCard}>
              <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
                Adjustment Type
              </Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    adjustmentType === "add"
                      ? styles.toggleBtnAddActive
                      : styles.toggleBtnInactive,
                  ]}
                  onPress={() => setAdjustmentType("add")}
                >
                  <Plus
                    size={24}
                    color={adjustmentType === "add" ? "#14532D" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      {
                        color: adjustmentType === "add" ? "#14532D" : "#6B7280",
                      },
                    ]}
                  >
                    Add Stock
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    adjustmentType === "remove"
                      ? styles.toggleBtnRemoveActive
                      : styles.toggleBtnInactive,
                  ]}
                  onPress={() => setAdjustmentType("remove")}
                >
                  <Minus
                    size={24}
                    color={adjustmentType === "remove" ? "#7F1D1D" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.toggleBtnText,
                      {
                        color:
                          adjustmentType === "remove" ? "#7F1D1D" : "#6B7280",
                      },
                    ]}
                  >
                    Remove Stock
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quantity Input */}
            <View style={styles.detailCard}>
              <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
                Adjustment Quantity
              </Text>
              <View style={styles.qtyControlBox}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    setQuantity((prev) =>
                      Math.max(1, parseInt(prev || "1") - 1).toString(),
                    )
                  }
                >
                  <Minus size={24} color="#374151" />
                </TouchableOpacity>
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 32,
                      fontFamily: Fonts?.bold,
                      color: "#111827",
                    }}
                  >
                    {quantity}
                  </Text>
                  <Text style={{ fontSize: 13, color: "#6B7280" }}>
                    {selectedItem?.unitOfMeasure || "units"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    setQuantity((prev) =>
                      (parseInt(prev || "0") + 1).toString(),
                    )
                  }
                >
                  <Plus size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginTop: 16,
                  marginBottom: 8,
                }}
              >
                Or enter directly:
              </Text>
              <TextInput
                style={styles.qtyInput}
                value={quantity}
                keyboardType="numeric"
                onChangeText={setQuantity}
                placeholder="0"
              />
            </View>

            {/* Reason Selection */}
            <View style={styles.detailCard}>
              <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
                Adjustment Reason
              </Text>
              <View style={styles.chipContainer}>
                {ADJUSTMENT_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.chip, reason === r.id && styles.chipActive]}
                    onPress={() => setReason(r.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        reason === r.id && styles.chipTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Notes */}
            <View style={styles.detailCard}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <FileText
                  size={18}
                  color="#4B5563"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontFamily: Fonts?.bold, marginBottom: 0 },
                  ]}
                >
                  Additional Notes
                </Text>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., Found extra stock behind shelf, dropped bottle..."
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bottom Action Bar */}
      {selectedItemId && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!quantity || parseInt(quantity) <= 0) && { opacity: 0.5 },
            ]}
            onPress={handleAdjustmentSubmit}
            disabled={!quantity || parseInt(quantity) <= 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <CheckCircle
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[styles.submitBtnText, { fontFamily: Fonts?.bold }]}
                >
                  Submit Adjustment
                </Text>
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

  contentPad: { flex: 1, padding: 16 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },

  card: {
    flexDirection: "row",
    alignItems: "center",
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
  cardTitle: { fontSize: 16, color: "#111827", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "#6B7280" },

  selectedContextCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contextRow: { flexDirection: "row", alignItems: "center" },
  contextLabel: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  contextValue: { fontSize: 15, color: "#111827" },
  changeBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeBtnText: { fontSize: 12, color: "#374151", fontWeight: "500" },

  detailCard: {
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
  sectionTitle: { fontSize: 15, color: "#111827", marginBottom: 12 },

  toggleRow: { flexDirection: "row", gap: 12 },
  toggleBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
  },
  toggleBtnInactive: { borderColor: "#E5E7EB", backgroundColor: "white" },
  toggleBtnAddActive: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
  toggleBtnRemoveActive: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  toggleBtnText: { marginTop: 8, fontSize: 14, fontWeight: "500" },

  qtyControlBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
  },
  qtyBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    elevation: 1,
  },
  qtyInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 16,
    backgroundColor: "white",
  },

  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  chipActive: { backgroundColor: "#FFF7ED", borderColor: "#EA580C" },
  chipText: { fontSize: 13, color: "#4B5563" },
  chipTextActive: { color: "#EA580C", fontWeight: "600" },

  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    height: 100,
    backgroundColor: "#F9FAFB",
  },

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
    backgroundColor: "#16A34A",
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { color: "white", fontSize: 16 },
});

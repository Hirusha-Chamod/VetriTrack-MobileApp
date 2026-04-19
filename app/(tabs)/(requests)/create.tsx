import { Colors, Fonts } from "@/constants/theme";
import { useApprovalStore } from "@/store/useApprovalStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "expo-router";
import { ChevronLeft, Minus, Package, Plus, Search } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
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

export default function CreateRequestScreen() {
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const { items, fetchItems } = useInventoryStore();
  const { createRequest, isLoading } = useApprovalStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Form State
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("low");

  // TODO: Replace with actual suppliers from your SupplierStore later!
  const DUMMY_SUPPLIER_ID = "65f0a1b2c3d4e5f6a1b2c3d4";

  useEffect(() => {
    if (items.length === 0) fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.itemName.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    // Auto-suggest quantity based on reorder point
    const current = item.currentStock || 0;
    if (current <= item.minStockLevel) {
      setQuantity(
        item.minStockLevel - current > 0 ? item.minStockLevel - current : 1,
      );
    } else {
      setQuantity(1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedItem) return;
    if (!reason.trim()) {
      showToast("Please provide a reason for the request", "error");
      return;
    }

    try {
      await createRequest({
        itemId: selectedItem._id,
        product: selectedItem.itemName,
        quantity: quantity,
        unitPrice: selectedItem.unitPrice || 0,
        supplierId: DUMMY_SUPPLIER_ID, // Hardcoded for now
        urgency,
        reason: reason.trim(),
      });
      showToast("Request submitted successfully!", "success");
      router.push({
        pathname: "/(tabs)/(requests)/confirmation",
        params: {
          itemName: selectedItem.itemName,
          quantity: quantity.toString(),
          unit: selectedItem.unitOfMeasure || "",
        },
      } as any);
    } catch (error: any) {
      showToast(error.message || "Failed to submit request", "error");
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

      {/* Header */}
      <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconBg}>
                <Package size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  New Request
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Create a manual reorder request
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {!selectedItem ? (
        <View style={{ flex: 1 }}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Search size={20} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search inventory items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Item List */}
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isLowStock = (item.currentStock || 0) <= item.minStockLevel;
              return (
                <TouchableOpacity
                  style={styles.itemCard}
                  activeOpacity={0.7}
                  onPress={() => handleSelectItem(item)}
                >
                  <View style={styles.itemTop}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.itemName, { fontFamily: Fonts?.bold }]}
                      >
                        {item.itemName}
                      </Text>
                      <View style={styles.badgeRow}>
                        <View
                          style={[styles.badge, { backgroundColor: "#DBEAFE" }]}
                        >
                          <Text
                            style={[styles.badgeText, { color: "#1D4ED8" }]}
                          >
                            {item.category}
                          </Text>
                        </View>
                        {isLowStock && (
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: "#FEE2E2" },
                            ]}
                          >
                            <Text
                              style={[styles.badgeText, { color: "#B91C1C" }]}
                            >
                              Low Stock
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.stockInfoRow}>
                        <Text style={styles.stockInfoText}>
                          Current:{" "}
                          <Text style={{ fontWeight: "600", color: "#111827" }}>
                            {item.currentStock || 0}
                          </Text>{" "}
                          {item.unitOfMeasure}
                        </Text>
                        <Text style={styles.stockInfoText}>
                          Reorder Point:{" "}
                          <Text style={{ fontWeight: "600", color: "#111827" }}>
                            {item.minStockLevel}
                          </Text>
                        </Text>
                      </View>
                    </View>
                    <Plus size={24} color="#2563EB" />
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Selected Item Summary */}
          <View style={styles.card}>
            <View style={styles.selectedHeader}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Package size={20} color="#2563EB" style={{ marginRight: 8 }} />
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontFamily: Fonts?.bold, marginBottom: 0 },
                  ]}
                >
                  Selected Item
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedItem(null)}>
                <Text style={styles.changeItemText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Item Name</Text>
              <Text style={styles.summaryValue}>{selectedItem.itemName}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Current Stock</Text>
              <Text style={styles.summaryValue}>
                {selectedItem.currentStock || 0} {selectedItem.unitOfMeasure}
              </Text>
            </View>
            <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.summaryLabel}>Reorder Point</Text>
              <Text style={styles.summaryValue}>
                {selectedItem.minStockLevel} {selectedItem.unitOfMeasure}
              </Text>
            </View>
          </View>

          {/* Quantity Controls */}
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Request Quantity
            </Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={[
                  styles.stepperBtn,
                  quantity <= 1 && styles.stepperBtnDisabled,
                ]}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus
                  size={20}
                  color={quantity <= 1 ? "#9CA3AF" : "#374151"}
                />
              </TouchableOpacity>
              <View style={styles.stepperValueBox}>
                <Text style={styles.stepperValue}>{quantity}</Text>
                <Text style={styles.stepperUnit}>
                  {selectedItem.unitOfMeasure}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity((q) => q + 1)}
              >
                <Plus size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Urgency & Notes */}
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Details
            </Text>

            <Text style={styles.inputLabel}>Urgency</Text>
            <View style={styles.urgencyRow}>
              {(["low", "medium", "high"] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.urgencyChip,
                    urgency === level && styles.urgencyChipActive,
                  ]}
                  onPress={() => setUrgency(level)}
                >
                  <Text
                    style={[
                      styles.urgencyChipText,
                      urgency === level && styles.urgencyChipTextActive,
                    ]}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { marginTop: 16 }]}>
              Reason / Notes *
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g., Running low, needed for upcoming surgeries..."
              value={reason}
              onChangeText={setReason}
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      )}

      {/* Submit Button */}
      {selectedItem && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!reason.trim() || quantity <= 0) && { opacity: 0.5 },
            ]}
            onPress={handleSubmit}
            disabled={!reason.trim() || quantity <= 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Package size={20} color="white" style={{ marginRight: 8 }} />
                <Text
                  style={[styles.submitBtnText, { fontFamily: Fonts?.bold }]}
                >
                  Submit Request
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

  searchContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },

  listContent: { padding: 16, gap: 12, paddingBottom: 40 },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: { fontSize: 16, color: "#111827", marginBottom: 6 },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  stockInfoRow: { flexDirection: "row", gap: 16 },
  stockInfoText: { fontSize: 12, color: "#6B7280" },

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

  selectedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 12,
    marginBottom: 12,
  },
  changeItemText: { color: "#2563EB", fontSize: 13, fontWeight: "600" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  summaryLabel: { fontSize: 14, color: "#6B7280" },
  summaryValue: { fontSize: 14, color: "#111827", fontWeight: "500" },

  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  stepperBtnDisabled: { opacity: 0.5 },
  stepperValueBox: { alignItems: "center" },
  stepperValue: { fontSize: 24, fontWeight: "bold", color: "#111827" },
  stepperUnit: { fontSize: 12, color: "#6B7280" },

  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  urgencyRow: { flexDirection: "row", gap: 8 },
  urgencyChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  urgencyChipActive: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  urgencyChipText: { fontSize: 14, color: "#4B5563", fontWeight: "500" },
  urgencyChipTextActive: { color: "#2563EB", fontWeight: "bold" },

  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    height: 100,
    fontSize: 15,
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
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { color: "white", fontSize: 16 },
});

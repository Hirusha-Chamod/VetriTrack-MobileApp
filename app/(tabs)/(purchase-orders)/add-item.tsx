import { Colors, Fonts } from "@/constants/theme";
import { useInventoryStore } from "@/store/useInventoryStore";
import { usePurchaseOrderStore } from "@/store/usePurchaseOrderStore";
import { useSupplierStore } from "@/store/useSupplierStore";
import { useToastStore } from "@/store/useToastStore";
import { safeGoBack } from "@/utils/navigation";
import { useFocusEffect, useRouter } from "expo-router";
import { Building2, ChevronRight, Plus, Search, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Step = "select-supplier" | "select-item" | "enter-quantity";

export default function AddItemToDraftPOScreen() {
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  // Bring in all three stores
  const { suppliers, fetchSuppliers } = useSupplierStore();
  const { items: inventoryItems, fetchItems } = useInventoryStore();
  const { drafts, createDraft, addItemToDraft, isLoading } =
    usePurchaseOrderStore();

  const [currentStep, setCurrentStep] = useState<Step>("select-supplier");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // NEW: Reset state every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setCurrentStep("select-supplier");
      setSelectedSupplierId("");
      setSelectedItemId("");
      setQuantity("");
      setSearchQuery("");
    }, []),
  );

  const getNumericLeadTime = (notes?: string) => {
    if (!notes) return 999;
    const match = notes.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  const lowestLeadTimeSupplier = React.useMemo(() => {
    if (suppliers.length === 0) return null;
    return suppliers.reduce((lowest, current) =>
      getNumericLeadTime(current.leadTimeNotes) <
      getNumericLeadTime(lowest.leadTimeNotes)
        ? current
        : lowest,
    );
  }, [suppliers]);

  useEffect(() => {
    // Ensure we have the latest data
    if (suppliers.length === 0) fetchSuppliers();
    if (inventoryItems.length === 0) fetchItems();
  }, []);

  const sortedSuppliers = [...suppliers].sort((a, b) =>
    a.supplierName.localeCompare(b.supplierName),
  );
  const filteredItems = inventoryItems.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedSupplier = suppliers.find((s) => s._id === selectedSupplierId);
  const selectedItem = inventoryItems.find((i) => i._id === selectedItemId);

  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSupplierId(supplierId);
    setCurrentStep("select-item");
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    setCurrentStep("enter-quantity");
  };

  const handleQuantitySubmit = async () => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) return;

    try {
      // 1. Check if a draft already exists for this supplier
      let targetDraftId = drafts.find((d) => {
        const dSupplierId =
          typeof d.supplierId === "object"
            ? (d.supplierId as any)._id
            : d.supplierId;
        return dSupplierId === selectedSupplierId;
      })?._id;

      // 2. If no draft exists, create one first
      if (!targetDraftId) {
        const newDraft = await createDraft({ supplierId: selectedSupplierId });
        targetDraftId = newDraft._id;
      }

      // 3. Add the item to the draft
      await addItemToDraft(targetDraftId, {
        itemId: selectedItemId,
        quantity: qty,
        unitPrice: selectedItem?.unitPrice || 0,
      });

      showToast("Item added to draft successfully!", "success");
      safeGoBack(router, "/(tabs)/(purchase-orders)/drafts");
    } catch (error: any) {
      showToast(error.message || "Failed to add item", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#F9FAFB" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#9333EA"
        translucent={false}
      />

      {/* Header - Purple 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#9333EA" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() =>
                safeGoBack(router, "/(tabs)/(purchase-orders)/drafts")
              }
              style={styles.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <Plus size={28} color="white" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Add Item
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Step{" "}
                  {currentStep === "select-supplier"
                    ? "1"
                    : currentStep === "select-item"
                      ? "2"
                      : "3"}{" "}
                  of 3
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Progress Breadcrumbs */}
      <View style={styles.breadcrumbBar}>
        <View
          style={[
            styles.crumbCol,
            currentStep === "select-supplier" && styles.crumbActive,
          ]}
        >
          <Text
            style={[
              styles.crumbTitle,
              currentStep === "select-supplier" && styles.crumbTextActive,
            ]}
          >
            1. Supplier
          </Text>
          <Text style={styles.crumbSub} numberOfLines={1}>
            {selectedSupplier ? selectedSupplier.supplierName : "..."}
          </Text>
        </View>
        <ChevronRight size={16} color="#D1D5DB" />

        <View
          style={[
            styles.crumbCol,
            currentStep === "select-item" && styles.crumbActive,
          ]}
        >
          <Text
            style={[
              styles.crumbTitle,
              currentStep === "select-item" && styles.crumbTextActive,
            ]}
          >
            2. Item
          </Text>
          <Text style={styles.crumbSub} numberOfLines={1}>
            {selectedItem ? selectedItem.itemName : "..."}
          </Text>
        </View>
        <ChevronRight size={16} color="#D1D5DB" />

        <View
          style={[
            styles.crumbCol,
            currentStep === "enter-quantity" && styles.crumbActive,
          ]}
        >
          <Text
            style={[
              styles.crumbTitle,
              currentStep === "enter-quantity" && styles.crumbTextActive,
            ]}
          >
            3. Quantity
          </Text>
          <Text style={styles.crumbSub} numberOfLines={1}>
            {quantity ? `${quantity} units` : "..."}
          </Text>
        </View>
      </View>

      <View style={styles.contentPad}>
        {/* STEP 1: Select Supplier */}
        {currentStep === "select-supplier" && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                Select a supplier to order from.
              </Text>
            </View>
            <FlatList
              data={sortedSuppliers}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item, index }) => {
                const isRecommended =
                  lowestLeadTimeSupplier &&
                  item._id === lowestLeadTimeSupplier._id;

                return (
                  <TouchableOpacity
                    style={[
                      styles.card,
                      selectedSupplierId === item._id && {
                        borderColor: "#9333EA",
                        borderWidth: 2,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSupplierSelect(item._id)}
                  >
                    <View style={styles.iconBg}>
                      <Building2 size={24} color="#9333EA" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={[
                            styles.cardTitle,
                            {
                              fontFamily: Fonts?.bold,
                              marginBottom: 0,
                              marginRight: 8,
                            },
                          ]}
                        >
                          {item.supplierName}
                        </Text>

                        {/* 👇 Show the badge! */}
                        {isRecommended && (
                          <View
                            style={{
                              backgroundColor: "#9333EA",
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 4,
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontSize: 10,
                                fontWeight: "bold",
                              }}
                            >
                              Recommended
                            </Text>
                          </View>
                        )}
                      </View>

                      {item.leadTimeNotes && (
                        <Text style={styles.cardSub}>
                          Lead time:{" "}
                          <Text
                            style={{ fontWeight: "bold", color: "#111827" }}
                          >
                            {item.leadTimeNotes}
                          </Text>
                        </Text>
                      )}
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                );
              }}
            />
          </>
        )}

        {/* STEP 2: Select Item */}
        {currentStep === "select-item" && (
          <>
            <View style={styles.selectedContextCard}>
              <View style={styles.contextRow}>
                <Building2
                  size={20}
                  color="#9333EA"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.contextLabel}>Selected Supplier</Text>
                  <Text
                    style={[styles.contextValue, { fontFamily: Fonts?.bold }]}
                  >
                    {selectedSupplier?.supplierName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setCurrentStep("select-supplier")}
                  style={styles.changeBtn}
                >
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search items..."
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
                  onPress={() => handleItemSelect(item._id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}
                    >
                      {item.itemName}
                    </Text>
                    <Text style={styles.cardSub}>
                      {item.category} • Min Stock: {item.minStockLevel}{" "}
                      {item.unitOfMeasure}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {/* STEP 3: Enter Quantity */}
        {currentStep === "enter-quantity" && (
          <>
            <View style={[styles.selectedContextCard, { paddingVertical: 12 }]}>
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.contextLabel}>Supplier</Text>
                <Text
                  style={[styles.contextValue, { fontFamily: Fonts?.bold }]}
                >
                  {selectedSupplier?.supplierName}
                </Text>
              </View>
              <View style={styles.divider} />
              <View>
                <Text style={styles.contextLabel}>Item</Text>
                <Text
                  style={[styles.contextValue, { fontFamily: Fonts?.bold }]}
                >
                  {selectedItem?.itemName}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.card,
                { padding: 20, flexDirection: "column", alignItems: "stretch" },
              ]}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: Fonts?.bold,
                  marginBottom: 16,
                }}
              >
                Enter Quantity ({selectedItem?.unitOfMeasure})
              </Text>

              <View style={styles.qtyControlBox}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    setQuantity((prev) =>
                      Math.max(0, parseInt(prev || "0") - 1).toString(),
                    )
                  }
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.qtyInput}
                  value={quantity}
                  keyboardType="numeric"
                  onChangeText={setQuantity}
                  placeholder="0"
                />
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    setQuantity((prev) =>
                      (parseInt(prev || "0") + 1).toString(),
                    )
                  }
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.priceSummaryBox}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Unit Price:</Text>
                  <Text style={styles.priceValue}>
                    LKR {selectedItem?.unitPrice.toLocaleString()}
                  </Text>
                </View>
                {quantity && parseInt(quantity) > 0 ? (
                  <View style={[styles.priceRow, { marginTop: 8 }]}>
                    <Text
                      style={[
                        styles.priceLabel,
                        { fontFamily: Fonts?.bold, color: "#111827" },
                      ]}
                    >
                      Total:
                    </Text>
                    <Text
                      style={[
                        styles.priceValue,
                        { fontFamily: Fonts?.bold, color: "#7E22CE" },
                      ]}
                    >
                      LKR{" "}
                      {(
                        (selectedItem?.unitPrice || 0) * parseInt(quantity)
                      ).toLocaleString()}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.btnPrimary,
                  (!quantity || parseInt(quantity) <= 0) && { opacity: 0.5 },
                ]}
                onPress={handleQuantitySubmit}
                disabled={!quantity || parseInt(quantity) <= 0 || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Plus size={20} color="white" style={{ marginRight: 8 }} />
                    <Text
                      style={[
                        styles.btnTextPrimary,
                        { fontFamily: Fonts?.bold },
                      ]}
                    >
                      Add to Draft
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
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
  closeBtn: { paddingRight: 8, paddingTop: 2 },
  headerTitleGroup: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 20, color: "white", marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },

  breadcrumbBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  crumbCol: { flex: 1, alignItems: "center" },
  crumbTitle: { fontSize: 13, color: "#9CA3AF", marginBottom: 4 },
  crumbSub: { fontSize: 11, color: "#9CA3AF" },
  crumbActive: {},
  crumbTextActive: { color: "#9333EA", fontWeight: "600" },

  contentPad: { flex: 1, padding: 16 },
  infoBox: {
    backgroundColor: "#FAF5FF",
    borderColor: "#E9D5FF",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBoxText: { color: "#581C87", fontSize: 13 },

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
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
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
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 12 },

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

  qtyControlBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  qtyBtnText: { fontSize: 20, color: "#374151" },
  qtyInput: {
    width: 80,
    height: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    textAlign: "center",
    marginHorizontal: 12,
    fontSize: 18,
    backgroundColor: "white",
  },

  priceSummaryBox: { backgroundColor: "#EFF6FF", padding: 16, borderRadius: 8 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: { fontSize: 14, color: "#1E3A8A" },
  priceValue: { fontSize: 14, color: "#1E3A8A" },

  actionRow: { marginTop: 16 },
  btnPrimary: {
    height: 52,
    borderRadius: 8,
    backgroundColor: "#9333EA",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnTextPrimary: { color: "white", fontSize: 16 },
});

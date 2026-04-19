import { Colors, Fonts } from "@/constants/theme";
import { approvalApi } from "@/services/approvalService";
import { purchaseOrderApi } from "@/services/purchaseOrderService";
import { Supplier, supplierApi } from "@/services/supplierService";
import { useAuthStore } from "@/store/useAuthStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useToastStore } from "@/store/useToastStore";
import { safeGoBack } from "@/utils/navigation";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  Minus,
  Package,
  Plus,
  Send,
  ShoppingCart,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LowStockDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  // Stores
  const { user } = useAuthStore();
  const isOwner = user?.role === "owner";
  const { items: inventoryItems } = useInventoryStore();

  const item = inventoryItems.find((i) => i._id === id);

  // State
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"review" | "suppliers" | "success">(
    "review",
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Initial Data & Calculate Suggestions
  useEffect(() => {
    if (item) {
      const current = item.currentStock || 0;
      const reorderPoint = item.minStockLevel || 0;
      const stockGap = Math.max(0, reorderPoint - current);
      const suggestedQty = Math.max(stockGap, Math.ceil(reorderPoint * 0.5));
      setQuantity(suggestedQty > 0 ? suggestedQty : 1);
    }

    const fetchSuppliers = async () => {
      try {
        const data = await supplierApi.getAll();
        const activeSuppliers = data.filter((s) => s.status === "Active");
        setSuppliers(activeSuppliers);
      } catch (error) {
        // Silently fail, handled in UI
      } finally {
        setIsLoadingSuppliers(false);
      }
    };
    fetchSuppliers();
  }, [item]);

  // Helper to extract numeric value from string like "5 days"
  const getNumericLeadTime = (notes?: string) => {
    if (!notes) return 999;
    const match = notes.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  const lowestLeadTimeSupplier = useMemo(() => {
    if (suppliers.length === 0) return null;
    return suppliers.reduce((lowest, current) =>
      getNumericLeadTime(current.leadTimeNotes) <
      getNumericLeadTime(lowest.leadTimeNotes)
        ? current
        : lowest,
    );
  }, [suppliers]);

  if (!item) {
    return (
      <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
        <View style={[styles.headerWrapper, { backgroundColor: "#EA580C" }]}>
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <ChevronLeft size={28} color="white" />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Item Not Found
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  const currentStock = item.currentStock || 0;
  const reorderPoint = item.minStockLevel || 0;
  const severity =
    reorderPoint > 0 && (currentStock / reorderPoint) * 100 <= 50
      ? "critical"
      : "warning";
  const isCritical = severity === "critical";
  const itemPrice = item.unitPrice || 0;

  // Actions
  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleOwnerNext = () => {
    setStep("suppliers");
    if (lowestLeadTimeSupplier)
      setSelectedSupplierId(lowestLeadTimeSupplier._id);
  };

  const handleStaffSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Staff doesn't select a supplier, so we pick the fastest one or fallback to a dummy if none exist
      const defaultSupplierId =
        lowestLeadTimeSupplier?._id || "65f0a1b2c3d4e5f6a1b2c3d4";

      await approvalApi.createRequest({
        itemId: item._id,
        product: item.itemName,
        quantity: quantity,
        supplierId: defaultSupplierId,
        unitPrice: itemPrice,
        urgency: isCritical ? "high" : "medium",
        source: "low-stock",
        reason: "Low stock alert auto-generated request",
      });

      showToast("Reorder request submitted successfully!", "success");
      safeGoBack(router, "/(tabs)/(low-stock)");
    } catch (error: any) {
      showToast(error.message || "Failed to submit request", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOwnerConfirmPO = async () => {
    if (!selectedSupplierId) return;
    setIsSubmitting(true);
    try {
      // 1. Get drafts
      const drafts = await purchaseOrderApi.getDrafts();
      // 2. Find if a draft exists for this supplier
      let draft = drafts.find((d) => {
        const dId =
          typeof d.supplierId === "object"
            ? (d.supplierId as any)._id
            : d.supplierId;
        return dId === selectedSupplierId;
      });
      // 3. Create one if it doesn't exist
      if (!draft) {
        draft = await purchaseOrderApi.createDraft({
          supplierId: selectedSupplierId,
          notes: "Generated from Low Stock Alerts",
        });
      }
      // 4. Add item
      await purchaseOrderApi.addItemToDraft(draft._id, {
        itemId: item._id,
        quantity: quantity,
        unitPrice: itemPrice,
      });

      setStep("success");
    } catch (error: any) {
      showToast(error.message || "Failed to create PO", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // STEP 3: OWNER SUCCESS VIEW
  // ==========================================
  if (step === "success") {
    const selectedSupplier = suppliers.find(
      (s) => s._id === selectedSupplierId,
    );
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: "#F9FAFB", justifyContent: "center", padding: 16 },
        ]}
      >
        <View style={styles.card}>
          <View style={{ padding: 32, alignItems: "center" }}>
            <View style={styles.successIconBg}>
              <Check size={32} color="#16A34A" />
            </View>
            <Text style={[styles.successTitle, { fontFamily: Fonts?.bold }]}>
              Added to Draft PO
            </Text>
            <Text style={[styles.successItemName, { fontFamily: Fonts?.bold }]}>
              {item.itemName}
            </Text>
            <Text style={styles.successDesc}>
              {quantity} {item.unitOfMeasure} added to Draft PO for{" "}
              {selectedSupplier?.supplierName}
            </Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                router.replace("/(tabs)/(purchase-orders)/" as any)
              }
            >
              <Text style={styles.primaryBtnText}>View Draft POs</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => safeGoBack(router, "/(tabs)/(low-stock)")}
            >
              <Text style={styles.outlineBtnText}>Back to Low Stock</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // ==========================================
  // STEP 2: OWNER SUPPLIER SELECTION
  // ==========================================
  if (isOwner && step === "suppliers") {
    return (
      <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={isCritical ? "#DC2626" : "#EA580C"}
          translucent={false}
        />
        <View
          style={[
            styles.headerWrapper,
            { backgroundColor: isCritical ? "#DC2626" : "#EA580C" },
          ]}
        >
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => setStep("review")}
                style={styles.backBtn}
              >
                <ChevronLeft size={28} color="white" />
              </TouchableOpacity>
              <View>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Select Supplier
                </Text>
                <Text style={styles.headerSubtitle}>
                  {item.itemName} - {quantity} {item.unitOfMeasure}
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.helperText}>
            Select a supplier to add this item to their Draft PO:
          </Text>

          {isLoadingSuppliers ? (
            <ActivityIndicator
              size="large"
              color="#2563EB"
              style={{ marginTop: 20 }}
            />
          ) : (
            suppliers.map((supplier) => {
              const isSelected = selectedSupplierId === supplier._id;
              const isRecommended =
                lowestLeadTimeSupplier &&
                supplier._id === lowestLeadTimeSupplier._id;

              return (
                <TouchableOpacity
                  key={supplier._id}
                  style={[
                    styles.supplierCard,
                    isSelected && styles.supplierCardActive,
                  ]}
                  onPress={() => setSelectedSupplierId(supplier._id)}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <Text style={styles.supplierName}>
                        {supplier.supplierName}
                      </Text>
                      {isRecommended && (
                        <View style={styles.recommendedBadge}>
                          <Text style={styles.recommendedText}>
                            Recommended Supplier
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.supplierAddress}>
                      {supplier.address}
                    </Text>
                    <View style={{ flexDirection: "row", gap: 16 }}>
                      <Text style={styles.supplierMeta}>
                        Est. Price:{" "}
                        <Text style={{ fontWeight: "bold", color: "#111827" }}>
                          LKR {itemPrice.toLocaleString()}
                        </Text>
                      </Text>
                      <Text style={styles.supplierMeta}>
                        Lead Time:{" "}
                        <Text style={{ fontWeight: "bold", color: "#111827" }}>
                          {supplier.leadTimeNotes || "Unknown"}
                        </Text>
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          {lowestLeadTimeSupplier && !isLoadingSuppliers && (
            <View style={styles.tipBox}>
              <Text style={styles.tipText}>
                <Text style={{ fontWeight: "bold" }}>💡 Tip:</Text> Recommended
                based on shortest delivery time.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomBarStacked}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!selectedSupplierId || isSubmitting) && { opacity: 0.5 },
            ]}
            onPress={handleOwnerConfirmPO}
            disabled={!selectedSupplierId || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <ShoppingCart
                  size={20}
                  color="white"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.primaryBtnText}>Add to Draft PO</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => setStep("review")}
          >
            <Text style={styles.outlineBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ==========================================
  // STEP 1: SHARED DETAIL VIEW
  // ==========================================
  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={isCritical ? "#DC2626" : "#EA580C"}
        translucent={false}
      />

      {/* Header Info */}
      <View
        style={[
          styles.headerWrapper,
          { backgroundColor: isCritical ? "#DC2626" : "#EA580C" },
        ]}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.headerIconBgLight}>
              <AlertTriangle size={24} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                {item.itemName}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isCritical ? "#991B1B" : "#9A3412",
                    alignSelf: "flex-start",
                    marginTop: 4,
                  },
                ]}
              >
                <Text style={[styles.badgeText, { color: "white" }]}>
                  {isCritical ? "Critical" : "Warning"} Stock Level
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
        {/* Alert Info Card */}
        <View
          style={[
            styles.card,
            {
              borderLeftWidth: 4,
              borderLeftColor: isCritical ? "#DC2626" : "#EA580C",
              backgroundColor: isCritical ? "#FEF2F2" : "#FFF7ED",
            },
          ]}
        >
          <View style={{ padding: 16 }}>
            <Text
              style={[
                styles.alertCardTitle,
                {
                  color: isCritical ? "#7F1D1D" : "#7C2D12",
                  fontFamily: Fonts?.bold,
                },
              ]}
            >
              {isCritical ? "Immediate Action Required" : "Low Stock Alert"}
            </Text>
            <Text
              style={[
                styles.alertCardDesc,
                { color: isCritical ? "#991B1B" : "#9A3412" },
              ]}
            >
              {isCritical
                ? "Stock level is critically low. Immediate reorder recommended to prevent stockout."
                : "Stock level is below reorder point. Reorder recommended to maintain adequate inventory."}
            </Text>
          </View>
        </View>

        {/* Stock Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Package size={20} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              Stock Information
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Stock</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isCritical ? "#DC2626" : "#EA580C" },
                ]}
              >
                {currentStock} {item.unitOfMeasure}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reorder Point</Text>
              <Text style={styles.infoValue}>
                {reorderPoint} {item.unitOfMeasure}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{item.category}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Unit Price</Text>
              <Text style={styles.infoValue}>
                LKR {itemPrice.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quantity Selector Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
                {isOwner ? "Order Quantity" : "Request Quantity"}
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                Suggested:{" "}
                {Math.max(
                  reorderPoint - currentStock,
                  Math.ceil(reorderPoint * 0.5),
                )}{" "}
                {item.unitOfMeasure}
              </Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.stepperBox}>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={handleDecrement}
                disabled={quantity <= 1}
              >
                <Minus
                  size={20}
                  color={quantity <= 1 ? "#9CA3AF" : "#374151"}
                />
              </TouchableOpacity>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{ fontSize: 30, fontWeight: "500", color: "#111827" }}
                >
                  {quantity}
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280" }}>
                  {item.unitOfMeasure}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={handleIncrement}
              >
                <Plus size={20} color="#374151" />
              </TouchableOpacity>
            </View>

            <View style={styles.costBox}>
              <Text style={{ fontSize: 14, color: "#4B5563" }}>
                Estimated Cost:
              </Text>
              <Text
                style={{ fontSize: 14, color: "#1D4ED8", fontWeight: "600" }}
              >
                LKR {(quantity * itemPrice).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Role-Specific Note */}
        <View
          style={[styles.card, { backgroundColor: "#EFF6FF", padding: 16 }]}
        >
          <Text style={{ fontSize: 13, color: "#1E3A8A", lineHeight: 18 }}>
            {isOwner ? (
              <>
                <Text style={{ fontWeight: "bold" }}>Direct Procurement:</Text>{" "}
                This item will be added to a supplier-specific Draft PO. You'll
                select the supplier on the next step.
              </>
            ) : (
              <>
                <Text style={{ fontWeight: "bold" }}>Note:</Text> This will
                create a reorder request for owner approval. Supplier selection
                will be done by the owner.
              </>
            )}
          </Text>
        </View>
      </ScrollView>

      {/* Role-Specific Bottom Bar */}
      <View style={styles.bottomBarStacked}>
        {isOwner ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleOwnerNext}>
            <Text style={styles.primaryBtnText}>Next: Select Supplier</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleStaffSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Send size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>
                  Submit Reorder Request
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.outlineBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerWrapper: { paddingBottom: 16 },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: { paddingRight: 8, paddingTop: 2 },
  headerTitle: { fontSize: 20, color: "white", marginBottom: 2 },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  headerIconBgLight: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    justifyContent: "center",
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  scrollContent: { padding: 16, paddingBottom: 140 },
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
  },
  cardTitle: { fontSize: 16, color: "#111827" },
  cardBody: { padding: 16 },

  alertCardTitle: { fontSize: 14, marginBottom: 8 },
  alertCardDesc: { fontSize: 14, lineHeight: 20 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 14, color: "#4B5563" },
  infoValue: { fontSize: 14, fontWeight: "500", color: "#111827" },

  stepperBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  costBox: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  helperText: { fontSize: 14, color: "#4B5563", marginBottom: 16 },

  supplierCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  supplierCardActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  supplierName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: { color: "white", fontSize: 10, fontWeight: "bold" },
  supplierAddress: { fontSize: 13, color: "#6B7280", marginBottom: 8 },
  supplierMeta: { fontSize: 12, color: "#4B5563" },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginTop: 4,
  },
  tipBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tipText: { color: "#1E3A8A", fontSize: 13 },

  successIconBg: {
    width: 64,
    height: 64,
    backgroundColor: "#DCFCE7",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  successTitle: { fontSize: 20, color: "#111827", marginBottom: 8 },
  successItemName: { fontSize: 16, color: "#4B5563", marginBottom: 4 },
  successDesc: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },

  bottomBarStacked: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    height: 50,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  outlineBtn: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    width: "100%",
  },
  outlineBtnText: { color: "#374151", fontSize: 16, fontWeight: "bold" },
});

import { Colors, Fonts } from "@/constants/theme";
import { approvalApi } from "@/services/approvalService";
import { purchaseOrderApi } from "@/services/purchaseOrderService";
import { Supplier, supplierApi } from "@/services/supplierService";
import { useAuthStore } from "@/store/useAuthStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useToastStore } from "@/store/useToastStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Check,
  Minus,
  MoreVertical,
  Package,
  Plus,
  Send,
  ShoppingCart,
  TrendingUp
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

export default function RecommendationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // id is the itemCode
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  // Stores
  const { user } = useAuthStore();
  const isOwner = user?.role === "owner";
  const { recommendations, items: inventoryItems } = useInventoryStore();

  // Find the recommendation AND the actual database item (for the _id)
  const recommendation = recommendations?.find((r) => r.itemCode === id);
  const actualItem = inventoryItems.find((i) => i.itemCode === id);

  // State
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"review" | "suppliers" | "success">(
    "review",
  );
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Initial Data
  useEffect(() => {
    if (recommendation) {
      setQuantity(
        recommendation.recommendedOrderQty > 0
          ? recommendation.recommendedOrderQty
          : 1,
      );
    }

    const fetchSuppliers = async () => {
      try {
        const data = await supplierApi.getAll();
        const activeSuppliers = data.filter((s) => s.status === "Active");
        setSuppliers(activeSuppliers);
      } catch (error) {
        // Handle silently
      } finally {
        setIsLoadingSuppliers(false);
      }
    };
    fetchSuppliers();
  }, [recommendation]);

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

  // AI Description Generator
  const getRecommendationMessage = (item: any) => {
    let msg = "";
    if (item.urgency === "HIGH") {
      msg = "Critical stock level. Expected to stock out before next delivery.";
    } else if (item.urgency === "MEDIUM") {
      msg = "Stock is dropping below safety levels. Reorder recommended.";
    } else {
      msg = "Stock levels are currently stable.";
    }

    if (item.isExpiringSoon) {
      const dateStr = new Date(item.nearestExpiryDate).toLocaleDateString(
        "en-GB",
        { month: "short", day: "numeric", year: "numeric" },
      );
      msg += `\n⚠️ Nearest batch expires on ${dateStr}.`;
    }
    return msg;
  };

  if (!recommendation || !actualItem) {
    return (
      <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
        <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
          <SafeAreaView>
            <View style={styles.headerTop}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Recommendation Not Found
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    );
  }

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
      const defaultSupplierId =
        lowestLeadTimeSupplier?._id || "65f0a1b2c3d4e5f6a1b2c3d4";

      await approvalApi.createRequest({
        itemId: actualItem._id, // Real Mongo ID
        product: actualItem.itemName,
        quantity: quantity,
        supplierId: defaultSupplierId,
        unitPrice: recommendation.unitPrice,
        urgency: recommendation.urgency === "HIGH" ? "high" : "medium",
        source: "recommendation",
        reason: "AI Forecasted Reorder Recommendation",
      });

      showToast("Reorder request submitted successfully!", "success");
      router.back();
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
      const drafts = await purchaseOrderApi.getDrafts();
      let draft = drafts.find((d) => {
        const dId =
          typeof d.supplierId === "object"
            ? (d.supplierId as any)._id
            : d.supplierId;
        return dId === selectedSupplierId;
      });

      if (!draft) {
        draft = await purchaseOrderApi.createDraft({
          supplierId: selectedSupplierId,
          notes: "Generated from Smart Recommendations",
        });
      }

      await purchaseOrderApi.addItemToDraft(draft._id, {
        itemId: actualItem._id,
        quantity: quantity,
        unitPrice: recommendation.unitPrice,
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
              {recommendation.itemName}
            </Text>
            <Text style={styles.successDesc}>
              {quantity} {recommendation.unitOfMeasure} added to Draft PO for{" "}
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
              onPress={() => router.back()}
            >
              <Text style={styles.outlineBtnText}>Back to Recommendations</Text>
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
          backgroundColor="#2563EB"
          translucent={false}
        />
        <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
          <SafeAreaView>
            <View style={styles.headerTop}>
              <TouchableOpacity
                onPress={() => setStep("review")}
                style={styles.backBtn}
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Select Supplier
              </Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={styles.headerSubtitle}>
                {recommendation.itemName} - {quantity}{" "}
                {recommendation.unitOfMeasure}
              </Text>
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
                            Fastest Delivery
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
                          LKR {recommendation.unitPrice.toLocaleString()}
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
  // STEP 1: SHARED DETAIL VIEW (FIGMA MATCH)
  // ==========================================
  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
        translucent={false}
      />

      {/* Header Info - Blue matching Figma */}
      <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
              Recommendation Detail
            </Text>
            <TouchableOpacity>
              <MoreVertical size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroBox}>
            <View style={styles.heroIconBg}>
              <TrendingUp size={24} color="white" />
            </View>
            <View>
              <Text style={[styles.heroItemName, { fontFamily: Fonts?.bold }]}>
                {recommendation.itemName}
              </Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  AI Forecasted · {recommendation.urgency} Urgency
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
        {/* Figma: Why this recommendation? */}
        <View style={styles.whyCard}>
          <Text style={[styles.whyTitle, { fontFamily: Fonts?.bold }]}>
            Why this recommendation?
          </Text>
          <Text style={styles.whyDesc}>
            {getRecommendationMessage(recommendation)}
          </Text>
        </View>

        {/* Figma: Stock Information */}
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
              <Text style={[styles.infoValue, { fontFamily: Fonts?.bold }]}>
                {recommendation.totalCurrentStock}{" "}
                {recommendation.unitOfMeasure}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Reorder Point</Text>
              <Text style={[styles.infoValue, { fontFamily: Fonts?.bold }]}>
                {recommendation.minStockLevel} {recommendation.unitOfMeasure}
              </Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Suggested Quantity</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: "#2563EB", fontFamily: Fonts?.bold },
                ]}
              >
                {recommendation.recommendedOrderQty}{" "}
                {recommendation.unitOfMeasure}
              </Text>
            </View>
          </View>
        </View>

        {/* Figma: Order Quantity Stepper */}
        <View style={styles.card}>
          <View style={[styles.cardBody, { paddingTop: 20 }]}>
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              {isOwner ? "Order Quantity" : "Request Quantity"}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                marginTop: 4,
                marginBottom: 16,
              }}
            >
              Adjust the quantity to add to{" "}
              {isOwner ? "Draft PO" : "Reorder Request"}
            </Text>

            <View style={styles.stepperContainer}>
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
              <View style={{ alignItems: "center", minWidth: 80 }}>
                <Text
                  style={{ fontSize: 32, fontWeight: "600", color: "#111827" }}
                >
                  {quantity}
                </Text>
                <Text style={{ fontSize: 13, color: "#6B7280" }}>
                  {recommendation.unitOfMeasure}
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
                LKR {(quantity * recommendation.unitPrice).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
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

  // Header matching Figma exactly
  headerWrapper: { paddingBottom: 24 },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 20,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, color: "white" },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginTop: 8,
    marginBottom: -8,
  },

  heroBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heroIconBg: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  heroItemName: { fontSize: 22, color: "white", marginBottom: 6 },
  confidenceBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  confidenceText: { color: "white", fontSize: 12, fontWeight: "600" },

  scrollContent: { padding: 16, paddingBottom: 160 },

  // Figma Why Card
  whyCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#2563EB",
    padding: 16,
    marginBottom: 16,
  },
  whyTitle: { fontSize: 14, color: "#1D4ED8", marginBottom: 6 },
  whyDesc: { fontSize: 14, color: "#1D4ED8", lineHeight: 20 },

  // Standard Cards
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
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

  // Stock Rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 14, color: "#4B5563" },
  infoValue: { fontSize: 15, color: "#111827" },

  // Stepper UI matching Figma
  stepperContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
    gap: 32,
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
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

  // Supplier & Success
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

  // Bottom Buttons
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
    backgroundColor: "white",
  },
  outlineBtnText: { color: "#374151", fontSize: 16, fontWeight: "bold" },
});

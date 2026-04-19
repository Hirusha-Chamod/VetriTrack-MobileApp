import { Colors, Fonts } from "@/constants/theme";
import { useInventoryStore } from "@/store/useInventoryStore";
import { usePurchaseOrderStore } from "@/store/usePurchaseOrderStore";
import { useRouter } from "expo-router";
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    Download,
    Package,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
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

export default function ReceiveStockScreen() {
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];

  const { purchaseOrders, fetchPurchaseOrders, isLoading } =
    usePurchaseOrderStore();
  const { items: inventoryItems, fetchItems } = useInventoryStore();

  const [selectedPOId, setSelectedPOId] = useState<string>("");
  console.log("All POs:", purchaseOrders);
  useEffect(() => {
    fetchPurchaseOrders();
    if (inventoryItems.length === 0) fetchItems();
  }, []);

  // Filter POs that are ready to receive (Sent or Partial)
  const availablePOs = purchaseOrders.filter(
    (po) => po.status === "Sent" || po.status === "Partial",
  );

  const selectedPO = availablePOs.find((po) => po._id === selectedPOId);

  const handleSelectLineItem = (poId: string, itemId: string) => {
    router.push({
      pathname: "/(tabs)/(transactions)/receive-item",
      params: { poId, itemId },
    } as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#16A34A"
        translucent={false}
      />

      {/* Header - Green 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#16A34A" }]}>
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
                <Download size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Receive Stock
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Record incoming inventory
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
        {/* Select PO Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Package size={20} color="#16A34A" style={{ marginRight: 8 }} />
              <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
                Select Purchase Order
              </Text>
            </View>
          </View>
          <View style={styles.cardBody}>
            {isLoading ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator color="#16A34A" />
              </View>
            ) : availablePOs.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconBg}>
                  <Package size={32} color="#9CA3AF" />
                </View>
                <Text style={styles.emptyTitle}>
                  No POs available for receiving
                </Text>
                <Text style={styles.emptySub}>
                  All purchase orders are fully received
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.helperText}>
                  Select a purchase order to receive items
                </Text>
                {availablePOs.map((po) => {
                  const supplierName =
                    typeof po.supplierId === "object"
                      ? (po.supplierId as any).supplierName
                      : "Unknown Supplier";
                  const isSelected = selectedPOId === po._id;

                  return (
                    <TouchableOpacity
                      key={po._id}
                      style={[
                        styles.poCard,
                        isSelected && styles.poCardSelected,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedPOId(po._id)}
                    >
                      <View style={styles.poCardTop}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.poCardNumber,
                              { fontFamily: Fonts?.bold },
                            ]}
                          >
                            {po.poNumber}
                          </Text>
                          <Text style={styles.poCardSupplier}>
                            {supplierName}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.badge,
                            {
                              backgroundColor:
                                po.status === "Sent" ? "#DBEAFE" : "#FFEDD5",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              {
                                color:
                                  po.status === "Sent" ? "#1D4ED8" : "#C2410C",
                              },
                            ]}
                          >
                            {po.status === "Sent" ? "Ready" : "Partial"}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.poCardFooter}>
                        {new Date(po.createdAt).toLocaleDateString("en-GB")} •
                        LKR {po.totalValue.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </View>
        </View>

        {/* PO Details Section - Only show when PO is selected */}
        {selectedPO && (
          <>
            {/* PO Information */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Building2
                    size={20}
                    color="#2563EB"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
                    PO Information
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>PO Number</Text>
                  <Text style={styles.infoValue}>{selectedPO.poNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Supplier</Text>
                  <Text style={styles.infoValue}>
                    {typeof selectedPO.supplierId === "object"
                      ? (selectedPO.supplierId as any).supplierName
                      : "Unknown"}
                  </Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.infoLabel}>PO Date</Text>
                  <Text style={styles.infoValue}>
                    {new Date(selectedPO.createdAt).toLocaleDateString("en-GB")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Line Items to Receive */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Package
                    size={20}
                    color="#16A34A"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
                    Items to Receive
                  </Text>
                </View>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.helperText}>
                  Tap an item to record receipt
                </Text>

                {selectedPO.items.map((item, idx) => {
                  // Fallback item name resolution
                  let itemName = "Unknown Item";
                  const itemIdStr =
                    typeof item.itemId === "object"
                      ? (item.itemId as any)._id
                      : item.itemId;

                  if (typeof item.itemId === "object" && item.itemId !== null) {
                    itemName = (item.itemId as any).itemName;
                  } else if (typeof item.itemId === "string") {
                    const foundItem = inventoryItems.find(
                      (i) => i._id === item.itemId,
                    );
                    if (foundItem) itemName = foundItem.itemName;
                  }

                  const remaining =
                    item.quantityRequested - item.quantityReceived;
                  const isComplete = remaining <= 0;

                  return (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.itemCard,
                        isComplete && styles.itemCardDisabled,
                      ]}
                      activeOpacity={isComplete ? 1 : 0.7}
                      onPress={() => {
                        if (!isComplete)
                          handleSelectLineItem(selectedPO._id, itemIdStr);
                      }}
                    >
                      <View style={styles.itemTop}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.itemName,
                              { fontFamily: Fonts?.bold },
                            ]}
                          >
                            {itemName}
                          </Text>
                          <Text style={styles.itemPrice}>
                            LKR {item.unitPrice.toLocaleString()} per unit
                          </Text>
                        </View>
                        {isComplete ? (
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: "#DCFCE7" },
                            ]}
                          >
                            <Text
                              style={[styles.badgeText, { color: "#15803D" }]}
                            >
                              Complete
                            </Text>
                          </View>
                        ) : (
                          <ChevronRight size={20} color="#9CA3AF" />
                        )}
                      </View>

                      <View style={styles.itemGrid}>
                        <View style={styles.gridCol}>
                          <Text style={styles.gridLabel}>Ordered</Text>
                          <Text style={styles.gridValue}>
                            {item.quantityRequested}
                          </Text>
                        </View>
                        <View style={styles.gridCol}>
                          <Text style={styles.gridLabel}>Received</Text>
                          <Text
                            style={[styles.gridValue, { color: "#16A34A" }]}
                          >
                            {item.quantityReceived}
                          </Text>
                        </View>
                        <View style={styles.gridCol}>
                          <Text style={styles.gridLabel}>Remaining</Text>
                          <Text
                            style={[
                              styles.gridValue,
                              remaining > 0
                                ? { color: "#EA580C" }
                                : { color: "#9CA3AF" },
                            ]}
                          >
                            {remaining}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {/* Info Box */}
        {!selectedPO && availablePOs.length > 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxText}>
              <Text style={{ fontWeight: "bold" }}>How it works:</Text> Select a
              purchase order above to view line items, then tap an item to
              record receipt with batch details.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardTitle: { fontSize: 16, color: "#111827" },
  cardBody: { padding: 16 },

  emptyState: { alignItems: "center", paddingVertical: 24 },
  emptyIconBg: {
    width: 64,
    height: 64,
    backgroundColor: "#F3F4F6",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 15, color: "#374151", marginBottom: 4 },
  emptySub: { fontSize: 13, color: "#9CA3AF" },

  helperText: { fontSize: 13, color: "#6B7280", marginBottom: 12 },

  poCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "white",
  },
  poCardSelected: { borderColor: "#22C55E", backgroundColor: "#F0FDF4" },
  poCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  poCardNumber: { fontSize: 15, color: "#111827", marginBottom: 4 },
  poCardSupplier: { fontSize: 13, color: "#4B5563" },
  poCardFooter: { fontSize: 12, color: "#6B7280" },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: "600" },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 14, color: "#4B5563" },
  infoValue: { fontSize: 14, color: "#111827", fontWeight: "500" },

  itemCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  itemCardDisabled: { backgroundColor: "#F9FAFB", opacity: 0.6 },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemName: { fontSize: 15, color: "#111827", marginBottom: 4 },
  itemPrice: { fontSize: 13, color: "#6B7280" },

  itemGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  gridCol: { flex: 1 },
  gridLabel: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  gridValue: { fontSize: 14, fontWeight: "600", color: "#111827" },

  infoBox: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoBoxText: { color: "#1E3A8A", fontSize: 13, lineHeight: 20 },
});

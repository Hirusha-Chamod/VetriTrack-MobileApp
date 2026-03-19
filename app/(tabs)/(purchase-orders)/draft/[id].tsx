import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePurchaseOrderStore } from "@/store/usePurchaseOrderStore";
import { useSupplierStore } from "@/store/useSupplierStore";
import { useToastStore } from "@/store/useToastStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Building2, ChevronLeft, Package, Send, X } from "lucide-react-native";
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

export default function DraftPODetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const { drafts, fetchDrafts, updatePoStatus, isLoading } =
    usePurchaseOrderStore();
  const { suppliers } = useSupplierStore();

  const [quantities, setQuantities] = useState<Record<string, number>>({});

  // Fetch drafts if the store happens to be empty on reload
  useEffect(() => {
    if (drafts.length === 0) {
      fetchDrafts();
    }
  }, []);

  // Find using the ID directly
  const draftPO = drafts.find((d) => d._id === id);

  // Initialize quantities state from the draft items
  useEffect(() => {
    if (draftPO) {
      const initialQtys: Record<string, number> = {};
      draftPO.items.forEach((item) => {
        const itemIdStr =
          typeof item.itemId === "object"
            ? (item.itemId as any)._id
            : item.itemId;
        initialQtys[itemIdStr] = item.quantityRequested;
      });
      setQuantities(initialQtys);
    }
  }, [draftPO]);

  if (!draftPO) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.headerWrapper,
            { backgroundColor: "#9333EA", width: "100%", paddingBottom: 16 },
          ]}
        >
          <SafeAreaView>
            <View
              style={[
                styles.headerContent,
                { paddingHorizontal: 16, paddingTop: 16 },
              ]}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ marginRight: 16 }}
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
              <View>
                <Text
                  style={{
                    fontSize: 20,
                    color: "white",
                    fontFamily: Fonts?.bold,
                  }}
                >
                  Draft Not Found
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  const handleUpdateQty = (itemId: string, qty: number) => {
    const newQty = Math.max(1, qty); // Prevent zero or negative
    setQuantities((prev) => ({ ...prev, [itemId]: newQty }));
  };

  const calculateTotal = () => {
    return draftPO.items.reduce((sum, item) => {
      const itemIdStr =
        typeof item.itemId === "object"
          ? (item.itemId as any)._id
          : item.itemId;
      const qty = quantities[itemIdStr] || item.quantityRequested;
      return sum + qty * item.unitPrice;
    }, 0);
  };

  const handleConfirmAndSend = async () => {
    try {
      await updatePoStatus(draftPO._id, "Sent");
      showToast("Purchase order sent successfully!", "success");
      router.push("/(tabs)/(purchase-orders)/list" as any);
    } catch (error: any) {
      showToast(error.message || "Failed to send PO", "error");
    }
  };

  let supplierName = "Unknown Supplier";
  if (draftPO?.supplierId) {
    if (
      typeof draftPO.supplierId === "object" &&
      "supplierName" in draftPO.supplierId
    ) {
      supplierName = (draftPO.supplierId as any).supplierName;
    } else {
      const foundSupplier = suppliers.find((s) => s._id === draftPO.supplierId);
      if (foundSupplier) {
        supplierName = foundSupplier.supplierName;
      }
    }
  }

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
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <Building2 size={28} color="white" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}
                  numberOfLines={1}
                >
                  {supplierName}
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Draft Purchase Order
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
        {/* PO Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              PO Information
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Supplier</Text>
              <Text style={styles.infoValue}>{supplierName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Draft ID</Text>
              <Text style={styles.infoValue}>{draftPO.poNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Updated</Text>
              <Text style={styles.infoValue}>
                {new Date(draftPO.updatedAt).toLocaleDateString("en-GB")}
              </Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Items Count</Text>
              <Text style={styles.infoValue}>{draftPO.items.length}</Text>
            </View>
          </View>
        </View>

        {/* Line Items Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              Line Items
            </Text>
            <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
              Edit quantities as needed before sending
            </Text>
          </View>
          <View style={styles.cardBody}>
            {draftPO.items.map((item, idx) => {
              const itemIdStr =
                typeof item.itemId === "object"
                  ? (item.itemId as any)._id
                  : item.itemId;
              const itemName =
                typeof item.itemId === "object"
                  ? (item.itemId as any).itemName
                  : "Unknown Item";
              const currentQty =
                quantities[itemIdStr] || item.quantityRequested;

              return (
                <View key={idx} style={styles.lineItemBox}>
                  <View style={styles.lineItemTop}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.lineItemName,
                          { fontFamily: Fonts?.bold },
                        ]}
                      >
                        {itemName}
                      </Text>
                      <Text style={styles.lineItemPrice}>
                        LKR {item.unitPrice.toLocaleString()} per unit
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.removeBtn}>
                      <X size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>

                  {/* Quantity Controls */}
                  <View style={styles.qtyControlWrapper}>
                    <View style={styles.qtyControlBox}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                          handleUpdateQty(itemIdStr, currentQty - 1)
                        }
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>

                      <TextInput
                        style={styles.qtyInput}
                        value={currentQty.toString()}
                        keyboardType="numeric"
                        onChangeText={(t) =>
                          handleUpdateQty(itemIdStr, parseInt(t) || 1)
                        }
                      />

                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() =>
                          handleUpdateQty(itemIdStr, currentQty + 1)
                        }
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontSize: 14,
                          color: "#4B5563",
                          marginLeft: 8,
                        }}
                      >
                        units
                      </Text>
                    </View>

                    <View style={styles.lineTotalBox}>
                      <Text style={styles.lineTotalLabel}>Line Total:</Text>
                      <Text
                        style={[
                          styles.lineTotalValue,
                          { fontFamily: Fonts?.bold },
                        ]}
                      >
                        LKR {(currentQty * item.unitPrice).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Total Summary */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: "#FAF5FF",
              borderColor: "#E9D5FF",
              borderWidth: 1,
            },
          ]}
        >
          <View
            style={[
              styles.cardBody,
              {
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
          >
            <View>
              <Text style={{ fontSize: 14, color: "#4B5563", marginBottom: 4 }}>
                Total Order Value
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  color: "#7E22CE",
                  fontFamily: Fonts?.bold,
                }}
              >
                LKR {calculateTotal().toLocaleString()}
              </Text>
            </View>
            <Package size={48} color="#D8B4FE" />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.sendBtn,
            draftPO.items.length === 0 && { opacity: 0.5 },
          ]}
          onPress={handleConfirmAndSend}
          disabled={draftPO.items.length === 0 || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Send size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.sendBtnText, { fontFamily: Fonts?.bold }]}>
                Confirm & Send PO
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  headerWrapper: { paddingBottom: 20 },
  headerContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: { paddingRight: 8, paddingTop: 2 },
  headerTitleGroup: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 20, color: "white", marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },

  scrollContent: { padding: 16, paddingBottom: 100 },

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

  // Info rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 14, color: "#4B5563" },
  infoValue: { fontSize: 14, color: "#111827", fontWeight: "500" },

  // Line Items
  lineItemBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  lineItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  lineItemName: { fontSize: 15, color: "#111827", marginBottom: 4 },
  lineItemPrice: { fontSize: 13, color: "#4B5563" },
  removeBtn: { padding: 4 },

  qtyControlWrapper: { gap: 12 },
  qtyControlBox: { flexDirection: "row", alignItems: "center" },
  qtyBtn: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  qtyBtnText: { fontSize: 18, color: "#374151" },
  qtyInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
    textAlign: "center",
    marginHorizontal: 8,
    fontSize: 15,
    backgroundColor: "white",
  },

  lineTotalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
  },
  lineTotalLabel: { fontSize: 14, color: "#4B5563" },
  lineTotalValue: { fontSize: 14, color: "#7E22CE" },

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
  sendBtn: {
    backgroundColor: "#16A34A",
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnText: { color: "white", fontSize: 16 },
});

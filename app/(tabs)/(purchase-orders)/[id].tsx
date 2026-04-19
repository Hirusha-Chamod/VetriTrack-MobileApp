import { Colors, Fonts } from "@/constants/theme";
import { useInventoryStore } from "@/store/useInventoryStore";
import { usePurchaseOrderStore } from "@/store/usePurchaseOrderStore";
import { useToastStore } from "@/store/useToastStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    AlertCircle,
    CheckCircle,
    ChevronLeft,
    Clock,
    Download,
    Mail,
    Package,
} from "lucide-react-native";
import React, { useState } from "react";
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

export default function PODetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];
  const { items: inventoryItems } = useInventoryStore();
  const showToast = useToastStore((state) => state.showToast);
  const { purchaseOrders, isLoading, sendReminder } = usePurchaseOrderStore();
  const [isReminding, setIsReminding] = useState(false);

  // Find the current PO from the store
  const po = purchaseOrders.find((p) => p._id === id);
  console.log("PO Detail - Fetched PO:", po);
  if (isLoading && !po) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!po) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.headerWrapper,
            { backgroundColor: "#2563EB", width: "100%", paddingBottom: 16 },
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
                  PO Not Found
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Sent":
        return { label: "Sent", color: "#1D4ED8", bg: "#DBEAFE", icon: Clock };
      case "Partial":
        return {
          label: "Partially Received",
          color: "#C2410C",
          bg: "#FFEDD5",
          icon: Package,
        };
      case "Received":
        return {
          label: "Fully Received",
          color: "#15803D",
          bg: "#DCFCE7",
          icon: CheckCircle,
        };
      case "Cancelled":
        return {
          label: "Cancelled",
          color: "#B91C1C",
          bg: "#FEE2E2",
          icon: AlertCircle,
        };
      default:
        return { label: status, color: "#374151", bg: "#F3F4F6", icon: Clock };
    }
  };

  const statusInfo = getStatusInfo(po.status);
  const StatusIcon = statusInfo.icon;

  const steps = [
    { label: "Sent", active: true },
    {
      label: "Partially Received",
      active: po.status === "Partial" || po.status === "Received",
    },
    { label: "Fully Received", active: po.status === "Received" },
  ];

  const totalOrdered = po.items.reduce(
    (sum, item) => sum + item.quantityRequested,
    0,
  );
  const totalReceived = po.items.reduce(
    (sum, item) => sum + item.quantityReceived,
    0,
  );
  const receiveProgress =
    totalOrdered > 0 ? (totalReceived / totalOrdered) * 100 : 0;

  // Extract populated fields
  const supplierName =
    typeof po.supplierId === "object"
      ? (po.supplierId as any).supplierName
      : "Unknown Supplier";

  // Check if we can send a reminder
  const canSendReminder = () => {
    if (po.status !== "Sent" && po.status !== "Partial") return false;
    if (!po.lastReminderSentAt) return true;

    const hoursSinceLastReminder =
      (new Date().getTime() - new Date(po.lastReminderSentAt).getTime()) /
      (1000 * 60 * 60);
    return hoursSinceLastReminder >= 24;
  };

  const isReminderLocked = !canSendReminder();

  const handleSendReminder = async () => {
    setIsReminding(true);
    try {
      await sendReminder(po._id);
      showToast("Reminder email sent to supplier!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to send reminder", "error");
    } finally {
      setIsReminding(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
        translucent={false}
      />

      {/* Header - Blue 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
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
              <Package size={28} color="white" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  {po.poNumber}
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {supplierName}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: statusInfo.bg, marginLeft: 64, marginTop: 8 },
            ]}
          >
            <StatusIcon
              size={14}
              color={statusInfo.color}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.badgeText,
                { color: statusInfo.color, fontFamily: Fonts?.bold },
              ]}
            >
              {statusInfo.label}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Timeline Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              PO Status Timeline
            </Text>
          </View>
          <View style={styles.cardBody}>
            {steps.map((step, idx) => (
              <View key={idx} style={styles.timelineRow}>
                <View style={styles.timelineIconCol}>
                  <View
                    style={[
                      styles.timelineDot,
                      step.active
                        ? styles.timelineDotActive
                        : styles.timelineDotInactive,
                    ]}
                  >
                    {step.active ? (
                      <CheckCircle size={16} color="#16A34A" />
                    ) : (
                      <Clock size={16} color="#9CA3AF" />
                    )}
                  </View>
                  {idx < steps.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        step.active
                          ? { backgroundColor: "#BBF7D0" }
                          : { backgroundColor: "#E5E7EB" },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.timelineText,
                    step.active
                      ? { color: "#111827", fontFamily: Fonts?.bold }
                      : { color: "#9CA3AF", fontFamily: Fonts?.sans },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* PO Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              PO Information
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>PO Number</Text>
              <Text style={styles.infoValue}>{po.poNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Supplier</Text>
              <Text style={styles.infoValue}>{supplierName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created Date</Text>
              <Text style={styles.infoValue}>
                {new Date(po.createdAt).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Total Value</Text>
              <Text style={[styles.infoValue, { color: "#2563EB" }]}>
                LKR {po.totalValue.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Receiving Progress */}
        {po.status !== "Received" && po.status !== "Cancelled" && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: "#FFF7ED",
                borderColor: "#FFEDD5",
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.cardBody}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Receiving Progress</Text>
                <Text style={styles.progressValue}>
                  {totalReceived} / {totalOrdered} units
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${receiveProgress}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        )}

        {/* Line Items */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              Line Items
            </Text>
          </View>
          <View style={styles.cardBody}>
            {po.items.map((item, idx) => {
              let itemName = "Unknown Item";
              if (typeof item.itemId === "object" && item.itemId !== null) {
                itemName = (item.itemId as any).itemName;
              } else if (typeof item.itemId === "string") {
                const foundItem = inventoryItems.find(
                  (i) => i._id === item.itemId,
                );
                if (foundItem) itemName = foundItem.itemName;
              }
              const isComplete =
                item.quantityReceived >= item.quantityRequested;
              const isPartial = item.quantityReceived > 0 && !isComplete;

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

                    {isComplete ? (
                      <View
                        style={[
                          styles.itemBadge,
                          { backgroundColor: "#DCFCE7" },
                        ]}
                      >
                        <CheckCircle
                          size={10}
                          color="#15803D"
                          style={{ marginRight: 4 }}
                        />
                        <Text
                          style={[styles.itemBadgeText, { color: "#15803D" }]}
                        >
                          Complete
                        </Text>
                      </View>
                    ) : isPartial ? (
                      <View
                        style={[
                          styles.itemBadge,
                          { backgroundColor: "#FFEDD5" },
                        ]}
                      >
                        <Text
                          style={[styles.itemBadgeText, { color: "#C2410C" }]}
                        >
                          Partial
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.itemBadge,
                          {
                            backgroundColor: "transparent",
                            borderWidth: 1,
                            borderColor: "#D1D5DB",
                          },
                        ]}
                      >
                        <Text
                          style={[styles.itemBadgeText, { color: "#4B5563" }]}
                        >
                          Pending
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.lineItemGrid}>
                    <View style={styles.gridCol}>
                      <Text style={styles.gridLabel}>Ordered</Text>
                      <Text style={styles.gridValue}>
                        {item.quantityRequested}
                      </Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.gridLabel}>Received</Text>
                      <Text style={[styles.gridValue, { color: "#16A34A" }]}>
                        {item.quantityReceived}
                      </Text>
                    </View>
                    <View style={styles.gridCol}>
                      <Text style={styles.gridLabel}>Remaining</Text>
                      <Text style={[styles.gridValue, { color: "#EA580C" }]}>
                        {item.quantityRequested - item.quantityReceived}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action */}

      {(po.status === "Sent" || po.status === "Partial") && (
        <View style={styles.bottomBarStacked}>
          {/* 👇 SafeAreaView moved INSIDE the absolute View */}
          <SafeAreaView>
            <TouchableOpacity
              style={[styles.receiveBtn, { marginBottom: 12 }]}
              onPress={() => router.push("/(tabs)/(transactions)/receive")}
            >
              <Download size={20} color="white" style={{ marginRight: 8 }} />
              <Text
                style={[styles.receiveBtnText, { fontFamily: Fonts?.bold }]}
              >
                Receive Stock
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.outlineBtn,
                isReminderLocked && {
                  backgroundColor: "#F3F4F6",
                  borderColor: "#E5E7EB",
                },
              ]}
              onPress={handleSendReminder}
              disabled={isReminderLocked || isReminding}
            >
              {isReminding ? (
                <ActivityIndicator color="#2563EB" size="small" />
              ) : (
                <>
                  <Mail
                    size={18}
                    color={isReminderLocked ? "#9CA3AF" : "#2563EB"}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.outlineBtnText,
                      {
                        fontFamily: Fonts?.bold,
                        color: isReminderLocked ? "#9CA3AF" : "#2563EB",
                      },
                    ]}
                  >
                    {isReminderLocked
                      ? "Reminder Sent Today"
                      : "Send Reminder Email"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      )}
    </View>
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

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: { fontSize: 13 },

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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardTitle: { fontSize: 16, color: "#111827" },
  cardBody: { padding: 16 },

  // Timeline
  timelineRow: { flexDirection: "row", alignItems: "flex-start" },
  timelineIconCol: { alignItems: "center", width: 32 },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineDotActive: { backgroundColor: "#DCFCE7" },
  timelineDotInactive: { backgroundColor: "#F3F4F6" },
  timelineLine: { width: 2, height: 32, marginVertical: 4 },
  timelineText: { fontSize: 14, marginTop: 6, marginLeft: 12 },

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

  // Progress
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: { fontSize: 14, color: "#374151" },
  progressValue: { fontSize: 14, color: "#C2410C", fontWeight: "600" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#FFEDD5",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#EA580C",
    borderRadius: 4,
  },

  // Line Items
  lineItemBox: {
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  lineItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  lineItemName: { fontSize: 15, color: "#111827", marginBottom: 4 },
  lineItemPrice: { fontSize: 13, color: "#4B5563" },
  itemBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemBadgeText: { fontSize: 11, fontWeight: "600" },

  lineItemGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 4,
  },
  gridCol: { flex: 1 },
  gridLabel: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  gridValue: { fontSize: 14, fontWeight: "600", color: "#111827" },

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
  receiveBtn: {
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  receiveBtnText: { color: "white", fontSize: 16 },
  bottomBarStacked: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 4,
  },
  outlineBtn: {
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2563EB",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  outlineBtnText: {
    fontSize: 16,
  },
});

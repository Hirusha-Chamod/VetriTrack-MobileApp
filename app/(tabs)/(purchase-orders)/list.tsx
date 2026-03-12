import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { usePurchaseOrderStore } from "@/store/usePurchaseOrderStore";
import { useRouter } from "expo-router";
import {
    AlertCircle,
    CheckCircle,
    ChevronRight,
    Clock,
    Package,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function PurchaseOrdersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { user, logout } = useAuthStore();
  const { purchaseOrders, fetchPurchaseOrders, isLoading, error } =
    usePurchaseOrderStore();

  // Custom Tab State matching backend statuses
  const tabs = ["All", "Sent", "Partial", "Received"];
  const [activeTab, setActiveTab] = useState("All");

  useEffect(() => {
    // Fetch POs on mount
    fetchPurchaseOrders();
  }, []);
  
  const filteredPOs = purchaseOrders.filter((po) => {
    if (po.status === "Draft") return false; // Drafts usually go in a separate screen
    if (activeTab === "All") return true;
    return po.status === activeTab;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Sent":
        return { label: "Sent", color: "#1D4ED8", bg: "#DBEAFE", icon: Clock }; // blue-700 / blue-100
      case "Partial":
        return {
          label: "Partial",
          color: "#C2410C",
          bg: "#FFEDD5",
          icon: AlertCircle,
        }; // orange-700 / orange-100
      case "Received":
        return {
          label: "Received",
          color: "#15803D",
          bg: "#DCFCE7",
          icon: CheckCircle,
        }; // green-700 / green-100
      case "Cancelled":
        return {
          label: "Cancelled",
          color: "#B91C1C",
          bg: "#FEE2E2",
          icon: AlertCircle,
        }; // red-700 / red-100
      default:
        return {
          label: status,
          color: "#374151",
          bg: "#F3F4F6",
          icon: AlertCircle,
        };
    }
  };

  const renderPOCard = ({ item: po }: any) => {
    const statusInfo = getStatusInfo(po.status);
    const StatusIcon = statusInfo.icon;

    // Calculate progress using backend field names
    const totalReceived = po.items.reduce(
      (sum: number, i: any) => sum + i.quantityReceived,
      0,
    );
    const totalOrdered = po.items.reduce(
      (sum: number, i: any) => sum + i.quantityRequested,
      0,
    );

    // Extract supplier name from populated object
    const supplierName =
      typeof po.supplierId === "object"
        ? po.supplierId.supplierName
        : "Unknown Supplier";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          router.push(`/(tabs)/(purchase-orders)/${po._id}` as any)
        }
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.poNumber, { fontFamily: Fonts?.bold }]}>
                {po.poNumber}
              </Text>
              <Text style={styles.supplierName}>{supplierName}</Text>

              <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                <StatusIcon
                  size={12}
                  color={statusInfo.color}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.badgeText, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" style={{ marginTop: 4 }} />
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Total Value:</Text>
              <Text style={[styles.footerValue, { fontFamily: Fonts?.bold }]}>
                LKR {po.totalValue.toLocaleString()}
              </Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Created:</Text>
              <Text style={[styles.footerValue, { fontFamily: Fonts?.bold }]}>
                {new Date(po.createdAt).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>

            {po.status === "Partial" && (
              <View style={styles.footerRow}>
                <Text style={styles.footerLabel}>Progress:</Text>
                <Text
                  style={[
                    styles.footerValue,
                    { color: "#EA580C", fontFamily: Fonts?.bold },
                  ]}
                >
                  {totalReceived}/{totalOrdered} units
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
        translucent={false}
      />

      {/* Top Utility Header */}
      <Header
        title="Orders Hub"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/")}
        onProfile={() => router.push("/profile" as any)}
      />

      {/* Main Feature Header - Blue 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <Package size={32} color="white" />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Purchase Orders
              </Text>
              <Text
                style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
              >
                {purchaseOrders.length} total orders
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentPad}>
        {/* Custom Segmented Tabs */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabButton,
                activeTab === tab && styles.tabButtonActive,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                  { fontFamily: Fonts?.bold },
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading && purchaseOrders.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: theme.danger, marginBottom: 12 }}>
              {error}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#2563EB",
                padding: 12,
                borderRadius: 6,
              }}
              onPress={() => fetchPurchaseOrders()}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredPOs}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => fetchPurchaseOrders()}
                tintColor="#2563EB"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                  <Package size={32} color="#9CA3AF" />
                </View>
                <Text style={[styles.emptyText, { fontFamily: Fonts?.sans }]}>
                  {activeTab === "All"
                    ? "No purchase orders yet"
                    : `No ${activeTab.toLowerCase()} orders`}
                </Text>
              </View>
            }
            renderItem={renderPOCard}
          />
        )}
      </View>
    </View>
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
  },
  headerTitle: { fontSize: 22, color: "white", marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },

  contentPad: { flex: 1, padding: 16 },

  // Custom Tabs
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: 13, color: "#6B7280" },
  tabTextActive: { color: "#111827" },

  listContent: { paddingBottom: 80 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardContent: { padding: 16 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  poNumber: { fontSize: 16, color: "#111827", marginBottom: 4 },
  supplierName: { fontSize: 14, color: "#4B5563", marginBottom: 8 },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    gap: 6,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: { fontSize: 13, color: "#6B7280" },
  footerValue: { fontSize: 13, color: "#111827" },

  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { alignItems: "center", paddingTop: 40 },
  emptyIconBg: {
    width: 64,
    height: 64,
    backgroundColor: "#F3F4F6",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: { color: "#6B7280", fontSize: 14 },
});

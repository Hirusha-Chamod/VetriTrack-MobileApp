import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    ExpiryReport,
    ExpiryReportItem,
    inventoryApi,
} from "@/services/inventoryService"; // Adjust path if needed
import { useRouter } from "expo-router";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    ChevronRight,
    MoreVertical,
    XCircle,
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

type Tab = "Expiring Soon" | "Expired";

export default function ExpiryManagementScreen() {
  const router = useRouter();
  const colorScheme = 'light';
  const theme = Colors[colorScheme];

  const [activeTab, setActiveTab] = useState<Tab>("Expired");
  const [report, setReport] = useState<ExpiryReport>({
    expiringSoon: [],
    expired: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryApi.getExpiryReport();
      setReport(data);
    } catch (error) {
      console.error("Failed to fetch expiry report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const expiringCount = report.expiringSoon.length;
  const expiredCount = report.expired.length;

  const renderCard = ({ item }: { item: ExpiryReportItem }) => {
    const isExpired = activeTab === "Expired";
    const dateObj = new Date(item.expiryDate);
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { borderLeftColor: isExpired ? "#DC2626" : "#F59E0B" },
        ]}
        activeOpacity={0.7}
        // Using batchId (e.g., RV-2024-001) as the route parameter
        onPress={() => router.push(`/(tabs)/(expiry)/${item.batchId}` as any)}
      >
        <View style={styles.cardTopRow}>
          <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
            {item.product}
          </Text>
          <ChevronRight size={20} color="#9CA3AF" />
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: isExpired ? "#FEF2F2" : "#FFF7ED" },
          ]}
        >
          {isExpired ? (
            <XCircle size={12} color="#DC2626" style={{ marginRight: 4 }} />
          ) : (
            <AlertTriangle
              size={12}
              color="#D97706"
              style={{ marginRight: 4 }}
            />
          )}
          <Text
            style={[
              styles.badgeText,
              {
                color: isExpired ? "#DC2626" : "#D97706",
                fontFamily: Fonts?.bold,
              },
            ]}
          >
            {isExpired ? "Expired" : "Expiring Soon"}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.gridCol}>
            <Text style={styles.gridLabel}>
              Batch: <Text style={styles.gridValue}>{item.batchId}</Text>
            </Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.gridLabel}>
              Quantity:{" "}
              <Text style={styles.gridValue}>
                {item.quantity} {item.unit}
              </Text>
            </Text>
          </View>
          <View style={styles.gridCol}>
            <Text style={styles.gridLabel}>
              Expiry:{" "}
              <Text
                style={[
                  styles.gridValue,
                  { color: isExpired ? "#DC2626" : "#D97706" },
                ]}
              >
                {formattedDate}
              </Text>
            </Text>
          </View>
          <View style={styles.gridCol}>
            {isExpired ? (
              <Text style={styles.gridLabel}>
                Expired:{" "}
                <Text style={[styles.gridValue, { color: "#DC2626" }]}>
                  {item.daysExpired} days ago
                </Text>
              </Text>
            ) : (
              <Text style={styles.gridLabel}>
                Time left:{" "}
                <Text style={[styles.gridValue, { color: "#D97706" }]}>
                  {item.daysUntilExpiry} days
                </Text>
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={false}
      />

      {/* Standard Header */}
      <SafeAreaView style={{ backgroundColor: "white" }}>
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
              Expiry Management
            </Text>
          </View>
          <TouchableOpacity>
            <MoreVertical size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Red Hero Section */}
      <View style={styles.heroSection}>
        <Calendar size={32} color="white" style={{ marginRight: 16 }} />
        <View>
          <Text style={[styles.heroTitle, { fontFamily: Fonts?.bold }]}>
            Expiry Management
          </Text>
          <Text style={styles.heroSubtitle}>
            Track expiring and expired items
          </Text>
        </View>
      </View>

      {/* Urgent Alert Banner */}
      {expiredCount > 0 && (
        <View style={styles.urgentBanner}>
          <XCircle size={24} color="#DC2626" style={{ marginRight: 12 }} />
          <View>
            <Text style={[styles.urgentTitle, { fontFamily: Fonts?.bold }]}>
              Urgent: {expiredCount} Expired Batches
            </Text>
            <Text style={styles.urgentSubtitle}>
              Remove from inventory immediately
            </Text>
          </View>
        </View>
      )}

      {/* Custom Segmented Tabs */}
      <View style={styles.tabContainerWrapper}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "Expiring Soon" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("Expiring Soon")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Expiring Soon" && styles.tabTextActive,
                { fontFamily: Fonts?.bold },
              ]}
            >
              Expiring Soon ({expiringCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "Expired" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("Expired")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Expired" && styles.tabTextActive,
                { fontFamily: Fonts?.bold },
              ]}
            >
              Expired ({expiredCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      ) : activeTab === "Expiring Soon" && expiringCount === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Calendar size={32} color="#16A34A" />
          </View>
          <Text style={[styles.emptyTitle, { fontFamily: Fonts?.bold }]}>
            All Good!
          </Text>
          <Text style={styles.emptyText}>
            No batches expiring in the next 30 days
          </Text>
        </View>
      ) : activeTab === "Expired" && expiredCount === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <Calendar size={32} color="#16A34A" />
          </View>
          <Text style={[styles.emptyTitle, { fontFamily: Fonts?.bold }]}>
            Great Job!
          </Text>
          <Text style={styles.emptyText}>You have zero expired batches</Text>
        </View>
      ) : (
        <View style={styles.listWrapper}>
          {activeTab === "Expired" && (
            <View style={styles.actionRequiredBanner}>
              <AlertTriangle
                size={16}
                color="#B45309"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <Text
                style={[styles.actionRequiredText, { fontFamily: Fonts?.bold }]}
              >
                Action Required: Remove these items from active inventory
              </Text>
            </View>
          )}

          <FlatList
            data={
              activeTab === "Expired" ? report.expired : report.expiringSoon
            }
            keyExtractor={(item) => item.batchId}
            renderItem={renderCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchReport}
                tintColor="#DC2626"
              />
            }
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, color: "#111827" },

  heroSection: {
    backgroundColor: "#DC2626", // Red 600
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroTitle: { color: "white", fontSize: 20, marginBottom: 4 },
  heroSubtitle: { color: "#FEF2F2", fontSize: 14 },

  urgentBanner: {
    backgroundColor: "#FEF2F2", // Red 50
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  urgentTitle: { color: "#991B1B", fontSize: 16, marginBottom: 2 },
  urgentSubtitle: { color: "#991B1B", fontSize: 13 },

  tabContainerWrapper: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: 14, color: "#4B5563" },
  tabTextActive: { color: "#111827" },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyIconBg: {
    width: 72,
    height: 72,
    backgroundColor: "#DCFCE7",
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, color: "#111827", marginBottom: 8 },
  emptyText: { color: "#4B5563", fontSize: 14 },

  listWrapper: { flex: 1, paddingHorizontal: 16 },
  actionRequiredBanner: {
    flexDirection: "row",
    backgroundColor: "#FFF7ED",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  actionRequiredText: {
    color: "#92400E",
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  listContent: { paddingBottom: 40 },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, color: "#111827" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 16,
  },
  badgeText: { fontSize: 12 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  gridCol: { width: "50%" },
  gridLabel: { fontSize: 13, color: "#6B7280" },
  gridValue: { color: "#111827", fontWeight: "600" },
});

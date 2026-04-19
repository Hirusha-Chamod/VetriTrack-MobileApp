import { Colors, Fonts } from "@/constants/theme";
import { useApprovalStore } from "@/store/useApprovalStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    FileText,
    Package,
    Plus,
    XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type TabStatus = "all" | "pending" | "approved" | "rejected";

export default function MyRequestsScreen() {
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];

  const { user } = useAuthStore();
  const isOwner = user?.role === "owner";

  const {
    myRequests,
    pendingRequests,
    fetchMyRequests,
    fetchPendingRequests,
    isLoading,
  } = useApprovalStore();

  const [activeTab, setActiveTab] = useState<TabStatus>("all");

  useEffect(() => {
    if (isOwner) {
      fetchPendingRequests();
    } else {
      fetchMyRequests();
    }
  }, [isOwner]);

  // Which list are we looking at?
  const sourceList = isOwner ? pendingRequests : myRequests;

  // Filter Logic
  const filteredRequests = sourceList.filter((req) => {
    if (activeTab === "all") return true;
    return req.status === activeTab;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Pending",
          bg: "#DBEAFE",
          text: "#1D4ED8",
          icon: Clock,
        };
      case "approved":
        return {
          label: "Approved",
          bg: "#DCFCE7",
          text: "#15803D",
          icon: CheckCircle,
        };
      case "rejected":
        return {
          label: "Rejected",
          bg: "#FEE2E2",
          text: "#B91C1C",
          icon: XCircle,
        };
      default:
        return { label: status, bg: "#F3F4F6", text: "#4B5563", icon: Package };
    }
  };

  const renderRequest = ({ item }: any) => {
    const statusInfo = getStatusInfo(item.status);
    const StatusIcon = statusInfo.icon;

    // Handle populated object or string ID safely
    const itemName =
      typeof item.itemId === "object" ? item.itemId.itemName : "Unknown Item";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/(requests)/${item._id}` as any)}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.requestTitle, { fontFamily: Fonts?.bold }]}>
              {itemName}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                <StatusIcon
                  size={12}
                  color={statusInfo.text}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.badgeText, { color: statusInfo.text }]}>
                  {statusInfo.label}
                </Text>
              </View>
              {item.urgency === "high" && (
                <View style={[styles.badge, { backgroundColor: "#FEE2E2" }]}>
                  <Text style={[styles.badgeText, { color: "#B91C1C" }]}>
                    High Urgency
                  </Text>
                </View>
              )}
            </View>
          </View>
          <ChevronRight size={20} color="#9CA3AF" />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Quantity:</Text>
            <Text style={styles.footerValue}>{item.quantity}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Total Amount:</Text>
            <Text style={styles.footerValue}>
              LKR {item.totalAmount?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Date:</Text>
            <Text style={styles.footerValue}>
              {new Date(item.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
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

      {/* Header - Blue 600 */}
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
                <FileText size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  {isOwner ? "Approval Center" : "My Requests"}
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {sourceList.length} total requests
                </Text>
              </View>
            </View>

            {/* Only Staff can create requests */}
            {!isOwner && (
              <TouchableOpacity
                style={styles.headerAddBtn}
                onPress={() => router.push("/(tabs)/(requests)/create" as any)}
              >
                <Plus size={16} color="white" style={{ marginRight: 4 }} />
                <Text
                  style={[styles.headerAddText, { fontFamily: Fonts?.bold }]}
                >
                  New
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {(["all", "pending", "approved", "rejected"] as TabStatus[]).map(
            (tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabBtn,
                  activeTab === tab && styles.tabBtnActive,
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab && styles.tabTextActive,
                  ]}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </ScrollView>
      </View>

      {/* List */}
      {isLoading && sourceList.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={isOwner ? fetchPendingRequests : fetchMyRequests}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <FileText size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No requests found</Text>
              <Text style={styles.emptyText}>
                {activeTab === "all"
                  ? "You haven't made any requests yet."
                  : `No ${activeTab} requests.`}
              </Text>
            </View>
          }
          renderItem={renderRequest}
        />
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
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: { paddingRight: 8 },
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

  headerAddBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerAddText: { color: "white", fontSize: 14 },

  tabContainer: {
    backgroundColor: "white",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabScroll: { paddingHorizontal: 16, gap: 8 },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  tabBtnActive: { backgroundColor: "#2563EB" },
  tabText: { fontSize: 14, color: "#4B5563", fontWeight: "500" },
  tabTextActive: { color: "white", fontWeight: "bold" },

  listContent: { padding: 16, paddingBottom: 40 },
  card: {
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
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  requestTitle: { fontSize: 16, color: "#111827", marginBottom: 6 },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  cardFooter: {
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
  },
  footerRow: { flexDirection: "row", justifyContent: "space-between" },
  footerLabel: { fontSize: 13, color: "#6B7280" },
  footerValue: { fontSize: 13, color: "#111827", fontWeight: "500" },

  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyIconBg: {
    width: 64,
    height: 64,
    backgroundColor: "#F3F4F6",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: { color: "#6B7280", fontSize: 14 },
});

import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useApprovalStore } from "@/store/useApprovalStore";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Clock,
  FileText,
  Lightbulb,
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

type TabFilter = "pending" | "all";
type SourceFilter = "all" | "recommendation" | "low-stock" | "manual";

export default function ApprovalCenterScreen() {
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];

  const { pendingRequests, fetchPendingRequests, isLoading } =
    useApprovalStore();
  const { user, logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabFilter>("pending");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  useEffect(() => {
    fetchPendingRequests();

  }, []);

  const filterBySource = (reqs: any[]) => {
    if (sourceFilter === "all") return reqs;
    // Fallback to 'manual' if source doesn't exist on the backend object yet
    return reqs.filter((r) => (r.source || "manual") === sourceFilter);
  };

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case "recommendation":
        return {
          label: "Recommendation",
          bg: "#CFFAFE",
          text: "#0369A1",
          icon: Lightbulb,
        };
      case "low-stock":
        return {
          label: "Low Stock",
          bg: "#FFEDD5",
          text: "#C2410C",
          icon: AlertTriangle,
        };
      case "manual":
      default:
        return {
          label: "Manual",
          bg: "#F3F4F6",
          text: "#4B5563",
          icon: FileText,
        };
    }
  };

  const renderRequestCard = ({ item }: any) => {
    const sourceBadge = getSourceBadge(item.source || "manual");
    const SourceIcon = sourceBadge.icon;
    const staffName =
      item.requestedBy && typeof item.requestedBy === "object"
        ? item.requestedBy.fullName
        : "Unknown Staff";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        // 👇 We route to the existing requests detail screen since it handles Owner Approval!
        onPress={() => router.push(`/(tabs)/(approvals)/${item._id}` as any)}
      >
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              Request #{item._id.slice(-6).toUpperCase()}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: "#DBEAFE" }]}>
                <Clock size={12} color="#1D4ED8" style={{ marginRight: 4 }} />
                <Text style={[styles.badgeText, { color: "#1D4ED8" }]}>
                  Pending Review
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: sourceBadge.bg }]}>
                <SourceIcon
                  size={12}
                  color={sourceBadge.text}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.badgeText, { color: sourceBadge.text }]}>
                  {sourceBadge.label}
                </Text>
              </View>
            </View>
          </View>
          <ChevronRight size={20} color="#9CA3AF" style={{ marginTop: 2 }} />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Requested By:</Text>
            <Text style={styles.footerValue}>{staffName}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Item:</Text>
            <Text style={styles.footerValue}>
              {item.product || "Unknown Item"}
            </Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Submitted:</Text>
            <Text style={styles.footerValue}>
              {format(new Date(item.createdAt), "MMM d, yyyy")}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const displayedRequests = filterBySource(pendingRequests);

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#16A34A"
        translucent={false}
      />

      <Header
        title="Approvals"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/" as any)}
        onProfile={() => router.push("/profile" as any)}
      />

      {/* Hero Banner - Green 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#16A34A" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleGroup}>
              <CheckCircle size={32} color="white" />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Approval Center
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {pendingRequests.length} pending review
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Alert Banner */}
      {pendingRequests.length > 0 && (
        <View style={styles.alertBanner}>
          <AlertCircle size={20} color="#EA580C" style={{ marginRight: 8 }} />
          <Text style={styles.alertText}>
            {pendingRequests.length} request
            {pendingRequests.length !== 1 ? "s" : ""} awaiting your approval
          </Text>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === "pending" && styles.tabBtnActive,
            ]}
            onPress={() => setActiveTab("pending")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pending" && styles.tabTextActive,
              ]}
            >
              Pending ({pendingRequests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === "all" && styles.tabBtnActive]}
            onPress={() => setActiveTab("all")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "all" && styles.tabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Source Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(
            ["all", "recommendation", "low-stock", "manual"] as SourceFilter[]
          ).map((source) => {
            const badge = getSourceBadge(source);
            const Icon = badge.icon;
            const isActive = sourceFilter === source;

            return (
              <TouchableOpacity
                key={source}
                style={[
                  styles.filterChip,
                  isActive && {
                    backgroundColor: source === "all" ? "#16A34A" : badge.bg,
                  },
                  !isActive && { backgroundColor: "#F3F4F6" },
                ]}
                onPress={() => setSourceFilter(source)}
              >
                {source !== "all" && (
                  <Icon
                    size={14}
                    color={isActive ? badge.text : "#4B5563"}
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && {
                      color: source === "all" ? "white" : badge.text,
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {source === "all"
                    ? "All"
                    : source === "low-stock"
                      ? "Low Stock"
                      : source.charAt(0).toUpperCase() + source.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      {isLoading && pendingRequests.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      ) : (
        <FlatList
          data={displayedRequests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchPendingRequests}
              colors={["#16A34A"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {sourceFilter === "all" ? (
                <>
                  <View style={styles.emptyIconBg}>
                    <CheckCircle size={32} color="#16A34A" />
                  </View>
                  <Text
                    style={[styles.emptyTitle, { fontFamily: Fonts?.bold }]}
                  >
                    All Caught Up!
                  </Text>
                  <Text style={styles.emptyText}>
                    No pending requests to review
                  </Text>
                </>
              ) : (
                <Text style={styles.emptyText}>
                  No requests match this filter
                </Text>
              )}
            </View>
          }
          renderItem={renderRequestCard}
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
    paddingHorizontal: 20,
    paddingTop: 10, // Adjusted padding to sit nicely under the global Header
  },
  headerTitleGroup: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 20, color: "white", marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.9)" },

  alertBanner: {
    backgroundColor: "#FFF7ED",
    borderBottomWidth: 1,
    borderBottomColor: "#FFEDD5",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  alertText: { color: "#9A3412", fontSize: 14, fontWeight: "500" },

  tabContainer: {
    backgroundColor: "white",
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: "#16A34A" },
  tabText: { fontSize: 15, color: "#6B7280", fontWeight: "500" },
  tabTextActive: { color: "#16A34A", fontWeight: "bold" },

  filterScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 16 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: { fontSize: 13, color: "#4B5563" },

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
  cardTitle: { fontSize: 16, color: "#111827", marginBottom: 8 },

  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  cardFooter: {
    gap: 6,
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
    backgroundColor: "#DCFCE7",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, color: "#111827", marginBottom: 8 },
  emptyText: { color: "#6B7280", fontSize: 14 },
});

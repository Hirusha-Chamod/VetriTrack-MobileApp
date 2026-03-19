import { Header } from "@/components/layout/Header";
import { Fonts } from "@/constants/theme";
import { useAnalyticsStore } from "@/store/useAnalyticsStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import {
    AlertTriangle,
    BarChart3,
    Building2,
    Package,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";

export default function AnalyticsDashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data, isLoading, error, fetchDashboard } = useAnalyticsStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Helper to format large currency numbers (e.g., 4800000 -> 4.8M)
  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `LKR ${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `LKR ${(val / 1000).toFixed(0)}K`;
    return `LKR ${val.toLocaleString()}`;
  };

  // Figma-matched Custom Tooltip for the Supplier Chart
  const renderTooltip = (item: any) => {
    return (
      <View style={styles.tooltipContainer}>
        <Text style={[styles.tooltipTitle, { fontFamily: Fonts?.bold }]}>
          {item.label}
        </Text>
        <Text style={[styles.tooltipValue, { fontFamily: Fonts?.sans }]}>
          Lead Time : {item.value} days
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#4F46E5"
        translucent={false}
      />
      <Header
        title="Analytics"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/" as any)}
        onProfile={() => router.push("/profile" as any)}
      />

      {/* Purple Hero Banner */}
      <View style={styles.heroBanner}>
        <SafeAreaView>
          <View style={styles.heroContent}>
            <BarChart3 size={32} color="white" />
            <View style={{ marginLeft: 16 }}>
              <Text style={[styles.heroTitle, { fontFamily: Fonts?.bold }]}>
                Analytics Dashboard
              </Text>
              <Text style={[styles.heroSubtitle, { fontFamily: Fonts?.sans }]}>
                Inventory & procurement insights
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchDashboard}
            colors={["#4F46E5"]}
          />
        }
      >
        {isLoading && !data ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : data ? (
          <>
            {/* Top Metrics Row */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <Package size={16} color="#2563EB" />
                  <Text
                    style={[styles.metricTitle, { fontFamily: Fonts?.sans }]}
                  >
                    Total Inventory Value
                  </Text>
                </View>
                <Text style={[styles.metricValue, { fontFamily: Fonts?.bold }]}>
                  {formatCurrency(data.inventory.totalValue)}
                </Text>
                <Text style={[styles.metricSub, { fontFamily: Fonts?.sans }]}>
                  Across {data.inventory.totalItemsCount} items
                </Text>
              </View>

              <View style={styles.metricCard}>
                <View style={styles.metricHeader}>
                  <AlertTriangle size={16} color="#DC2626" />
                  <Text
                    style={[styles.metricTitle, { fontFamily: Fonts?.sans }]}
                  >
                    Expiring Value
                  </Text>
                </View>
                <Text style={[styles.metricValue, { fontFamily: Fonts?.bold }]}>
                  {formatCurrency(data.inventory.expiringValue)}
                </Text>
                <Text
                  style={[
                    styles.metricSub,
                    { color: "#DC2626", fontFamily: Fonts?.sans },
                  ]}
                >
                  Next 60 days
                </Text>
              </View>
            </View>

            {/* Procurement Chart Card */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={[styles.iconBg, { backgroundColor: "#F3E8FF" }]}>
                  <BarChart3 size={20} color="#8B5CF6" />
                </View>
                <Text style={[styles.chartTitle, { fontFamily: Fonts?.bold }]}>
                  Procurement Order Status Summary
                </Text>
              </View>

              <View style={styles.chartWrapper}>
                <BarChart
                  data={data.charts.poSummary}
                  barWidth={36}
                  spacing={24}
                  roundedTop
                  xAxisThickness={1}
                  yAxisThickness={1}
                  yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  xAxisLabelTextStyle={{
                    color: "#4B5563",
                    fontSize: 10,
                    textAlign: "center",
                  }}
                  noOfSections={4}
                  isAnimated
                  hideRules={false}
                  rulesColor="#F3F4F6"
                  rulesType="dashed"
                  initialSpacing={10}
                />
              </View>
            </View>

            {/* Supplier Lead Time Chart Card */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={[styles.iconBg, { backgroundColor: "#E0F2FE" }]}>
                  <Building2 size={20} color="#0284C7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.chartTitle, { fontFamily: Fonts?.bold }]}
                  >
                    Supplier Lead Time Comparison
                  </Text>
                  <Text
                    style={[styles.chartSubtitle, { fontFamily: Fonts?.sans }]}
                  >
                    Used to suggest fastest supplier during procurement
                  </Text>
                </View>
              </View>

              <View style={styles.chartWrapper}>
                <BarChart
                  data={data.charts.supplierLeadTimes}
                  barWidth={32}
                  spacing={30}
                  roundedTop
                  xAxisThickness={1}
                  yAxisThickness={1}
                  yAxisTextStyle={{ color: "#6B7280", fontSize: 11 }}
                  xAxisLabelTextStyle={{
                    color: "#4B5563",
                    fontSize: 10,
                    rotation: -45,
                    marginTop: 4,
                  }}
                  noOfSections={5}
                  isAnimated
                  renderTooltip={renderTooltip}
                  autoCenterTooltip
                  initialSpacing={15}
                />
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  errorText: { color: "#DC2626", fontSize: 14 },

  heroBanner: { backgroundColor: "#4F46E5", paddingBottom: 24, paddingTop: 16 },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  heroTitle: { fontSize: 22, color: "white", marginBottom: 2 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },

  scrollContent: { padding: 16, paddingBottom: 40 },

  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  metricTitle: { fontSize: 13, color: "#4B5563" },
  metricValue: { fontSize: 22, color: "#111827", marginBottom: 4 },
  metricSub: { fontSize: 12, color: "#6B7280" },

  chartCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 24,
  },
  iconBg: { padding: 8, borderRadius: 8 },
  chartTitle: { fontSize: 16, color: "#111827", marginBottom: 2 },
  chartSubtitle: { fontSize: 12, color: "#6B7280", paddingRight: 10 },
  chartWrapper: { alignItems: "center", marginLeft: -10, overflow: "visible" },

  // Tooltip Styles
  tooltipContainer: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
    minWidth: 120,
    alignItems: "center",
  },
  tooltipTitle: { fontSize: 14, color: "#111827", marginBottom: 4 },
  tooltipValue: { fontSize: 13, color: "#38BDF8" },
});

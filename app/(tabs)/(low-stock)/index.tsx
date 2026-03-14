import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useRouter } from "expo-router";
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function LowStockScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { items, fetchItems, isLoading } = useInventoryStore();

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter to only items that are at or below their minimum stock level
  const lowStockItems = items.filter((item) => {
    const current = item.currentStock || 0;
    // Only flag as low stock if we actually have a min level set above 0, OR if current is 0
    return current <= item.minStockLevel;
  });

  // Calculate severity
  const getSeverity = (item: any): "critical" | "warning" => {
    const current = item.currentStock || 0;
    if (item.minStockLevel <= 0) return current <= 0 ? "critical" : "warning"; // Div-by-zero protection

    const percentage = (current / item.minStockLevel) * 100;
    return percentage <= 50 ? "critical" : "warning";
  };

  const criticalItems = lowStockItems.filter(
    (item) => getSeverity(item) === "critical",
  );
  const warningItems = lowStockItems.filter(
    (item) => getSeverity(item) === "warning",
  );

  const handleViewDetail = (itemId: string) => {
    // Navigate to the existing inventory details screen!
    router.push(`/(tabs)/(low-stock)/${itemId}` as any);
  };

  const renderItemCard = (item: any, severity: "critical" | "warning") => {
    const isCritical = severity === "critical";
    const currentStock = item.currentStock || 0;

    return (
      <TouchableOpacity
        key={item._id}
        style={[
          styles.card,
          { borderLeftColor: isCritical ? "#EF4444" : "#F97316" },
        ]}
        activeOpacity={0.7}
        onPress={() => handleViewDetail(item._id)}
      >
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemName, { fontFamily: Fonts?.bold }]}>
              {item.itemName}
            </Text>

            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isCritical ? "#FEE2E2" : "#FFEDD5" },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: isCritical ? "#B91C1C" : "#C2410C" },
                  ]}
                >
                  {isCritical ? "Critical" : "Warning"}
                </Text>
              </View>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>

            <View style={styles.stockInfoGrid}>
              <View style={styles.stockCol}>
                <Text style={styles.stockLabel}>On Hand:</Text>
                <Text
                  style={[
                    styles.stockValue,
                    { color: isCritical ? "#DC2626" : "#EA580C" },
                  ]}
                >
                  {currentStock} {item.unitOfMeasure}
                </Text>
              </View>
              <View style={styles.stockCol}>
                <Text style={styles.stockLabel}>Reorder Point:</Text>
                <Text style={[styles.stockValue, { color: "#111827" }]}>
                  {item.minStockLevel} {item.unitOfMeasure}
                </Text>
              </View>
            </View>
          </View>

          <ChevronRight size={20} color="#9CA3AF" style={{ marginTop: 2 }} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFF7ED"
        translucent={false}
      />

      {/* Header with Back Button */}
      <SafeAreaView style={{ backgroundColor: "#FFF7ED" }}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={28} color="#EA580C" />
          </TouchableOpacity>
          <View style={styles.headerTitleGroup}>
            <AlertTriangle
              size={24}
              color="#EA580C"
              style={{ marginRight: 8 }}
            />
            <View>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Low Stock Alert
              </Text>
              <Text
                style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
              >
                {criticalItems.length} critical, {warningItems.length} warning
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchItems}
            colors={["#EA580C"]}
          />
        }
      >
        {/* Critical Items Section */}
        {criticalItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertCircle
                size={16}
                color="#DC2626"
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: "#DC2626", fontFamily: Fonts?.bold },
                ]}
              >
                CRITICAL STOCK LEVEL
              </Text>
            </View>
            {criticalItems.map((item) => renderItemCard(item, "critical"))}
          </View>
        )}

        {/* Warning Items Section */}
        {warningItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle
                size={16}
                color="#EA580C"
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  { color: "#EA580C", fontFamily: Fonts?.bold },
                ]}
              >
                WARNING LEVEL
              </Text>
            </View>
            {warningItems.map((item) => renderItemCard(item, "warning"))}
          </View>
        )}

        {/* Empty State */}
        {lowStockItems.length === 0 && !isLoading && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <CheckCircle size={32} color="#16A34A" />
            </View>
            <Text style={[styles.emptyTitle, { fontFamily: Fonts?.bold }]}>
              All Stock Levels Healthy
            </Text>
            <Text style={styles.emptyText}>
              No items are currently below their reorder point.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#FFEDD5",
  },
  backBtn: { marginRight: 8 },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerTitle: { fontSize: 18, color: "#9A3412", marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: "#C2410C" },

  scrollContent: { padding: 16, paddingBottom: 40 },

  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, letterSpacing: 0.5 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  itemName: { fontSize: 16, color: "#111827", marginBottom: 6 },

  badgeRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "bold" },
  categoryText: { fontSize: 12, color: "#6B7280" },

  stockInfoGrid: { flexDirection: "row", gap: 16 },
  stockCol: { flex: 1 },
  stockLabel: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  stockValue: { fontSize: 14, fontWeight: "600" },

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

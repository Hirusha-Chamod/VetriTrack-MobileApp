import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useRouter } from "expo-router";
import { Package, Plus, Search, SlidersHorizontal } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface FilterState {
  stockStatus: "all" | "low-stock" | "in-stock";
  category: "all" | "vaccine" | "medication" | "supplement" | "treatment";
  sort: "name-asc" | "stock-asc";
}

export default function InventoryScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { items, fetchItems, isLoading, error } = useInventoryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    stockStatus: "all",
    category: "all",
    sort: "name-asc",
  });
  const [tempFilters, setTempFilters] = useState<FilterState>(filters);

  useEffect(() => {
    fetchItems();
  }, []);
  console.log("Inventory items:", items);
  const handleClearFilters = () => {
    const defaultFilters: FilterState = {
      stockStatus: "all",
      category: "all",
      sort: "name-asc",
    };
    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const hasActiveFilters =
    filters.stockStatus !== "all" ||
    filters.category !== "all" ||
    filters.sort !== "name-asc";

  // Filter Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (
        filters.category !== "all" &&
        item.category.toLowerCase() !== filters.category
      )
        return false;
      return true;
    });
  }, [items, searchQuery, filters]);

  // Figma Status Logic
  const getStockStatus = (current: number, reorder: number) => {
    if (current <= reorder * 0.5) {
      return { label: "Critical", color: "#B91C1C", bg: "#FEE2E2" }; // Red-700 / Red-100
    } else if (current <= reorder) {
      return { label: "Low", color: "#C2410C", bg: "#FFEDD5" }; // Orange-700 / Orange-100
    } else {
      return { label: "In Stock", color: "#15803D", bg: "#DCFCE7" }; // Green-700 / Green-100
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "vaccine":
        return "#2563EB";
      case "medication":
        return "#9333EA";
      case "supplement":
        return "#16A34A";
      case "treatment":
        return "#0D9488";
      default:
        return "#64748B";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar barStyle="light-content" backgroundColor="#374151" />
      <Header
        title="Inventory"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/" as any)}
        onProfile={() => router.push("/profile" as any)}
      />

      {/* Header - Matches Figma gray-700 */}
      <View style={styles.headerWrapper}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleGroup}>
              <Package size={32} color="white" />
              <View>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Inventory Overview
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {items.length} total items
                </Text>
              </View>
            </View>

            {user?.role === "owner" && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  router.push("/(tabs)/(inventory)/add-item" as any)
                }
              >
                <Plus size={16} color="white" />
                <Text
                  style={[styles.addButtonText, { fontFamily: Fonts?.bold }]}
                >
                  Add Item
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#94A3B8" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={styles.filterBtn}
          >
            <SlidersHorizontal size={20} color="#4B5563" />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </TouchableOpacity>
        </View>
        {hasActiveFilters && (
          <View style={styles.filterBadgeRow}>
            <Text style={styles.filterActiveText}>Filters applied</Text>
            <TouchableOpacity onPress={handleClearFilters}>
              <Text style={styles.clearBtnText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isLoading && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchItems} />
          }
          renderItem={({ item }) => {
            const currentStock = 0;
            const status = getStockStatus(currentStock, item.minStockLevel);

            return (
              <TouchableOpacity style={styles.itemCard} activeOpacity={0.7}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.itemName}</Text>
                    <View style={styles.cardBadgeRow}>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: status.bg },
                        ]}
                      >
                        <Text
                          style={[styles.statusText, { color: status.color }]}
                        >
                          {status.label}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.categoryText,
                          { color: getCategoryColor(item.category) },
                        ]}
                      >
                        {item.category}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 3-Column Stats Grid - Matches Figma */}
                <View style={styles.cardStatsGrid}>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Stock</Text>
                    <Text style={styles.statValue}>{currentStock}</Text>
                  </View>
                  <View style={[styles.statCol, styles.statBorder]}>
                    <Text style={styles.statLabel}>Reorder</Text>
                    <Text style={styles.statValue}>{item.minStockLevel}</Text>
                  </View>
                  <View style={styles.statCol}>
                    <Text style={styles.statLabel}>Price</Text>
                    <Text style={styles.statValue}>
                      LKR {item.unitPrice?.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Filter Modal Logic... */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { backgroundColor: "#374151", paddingBottom: 20 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: 20, color: "white" },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  addButton: {
    backgroundColor: "#0891B2",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addButtonText: { color: "white", fontSize: 14 },

  searchContainer: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInputWrapper: { flexDirection: "row", alignItems: "center", gap: 10 },
  searchIcon: { marginLeft: 4 },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterBtn: { padding: 8, borderRadius: 8, backgroundColor: "#F3F4F6" },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },

  listContent: { padding: 16, gap: 12 },
  itemCard: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTop: { padding: 16 },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  cardBadgeRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: "700" },
  categoryText: { fontSize: 12, fontWeight: "500" },

  cardStatsGrid: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingVertical: 12,
  },
  statCol: { flex: 1, alignItems: "center" },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#F3F4F6",
  },
  statLabel: { fontSize: 11, color: "#6B7280", marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: "600", color: "#111827" },

  filterBadgeRow: { flexDirection: "row", marginTop: 10, gap: 8 },
  filterActiveText: { fontSize: 12, color: "#6B7280" },
  clearBtnText: { fontSize: 12, color: "#2563EB", fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

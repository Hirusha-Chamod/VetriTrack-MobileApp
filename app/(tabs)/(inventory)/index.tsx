import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useToastStore } from "@/store/useToastStore";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  Download,
  MoreVertical,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface FilterState {
  stockStatus: "all" | "low-stock" | "in-stock";
  expiryStatus: "all" | "expiring-soon" | "expired";
  category:
    | "all"
    | "Vaccine"
    | "Medication"
    | "Supplement"
    | "Treatment"
    | "Surgical"
    | "Diagnostic";
  sort: "name-asc" | "stock-asc" | "expiry-asc";
}

const DEFAULT_FILTERS: FilterState = {
  stockStatus: "all",
  expiryStatus: "all",
  category: "all",
  sort: "name-asc",
};

export default function InventoryScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const showToast = useToastStore((state) => state.showToast);
  const colorScheme = "light";
  const theme = Colors[colorScheme];

  const { items, fetchItems, uploadInventory, exportInventory, isLoading } =
    useInventoryStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [tempFilters, setTempFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    fetchItems(filters);
  }, []);

  const handleClearFilters = () => {
    setTempFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    setShowFilters(false);
    fetchItems(DEFAULT_FILTERS);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setShowFilters(false);
    fetchItems(tempFilters);
  };

  const hasActiveFilters =
    filters.stockStatus !== "all" ||
    filters.expiryStatus !== "all" ||
    filters.category !== "all" ||
    filters.sort !== "name-asc";

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        item.itemName.toLowerCase().includes(searchLower) ||
        item.itemCode.toLowerCase().includes(searchLower)
      );
    });
  }, [items, searchQuery]);

  // ─── IMPORT LOGIC ─────────────────────────────────────────────────────────
  const handleImport = () => {
    setIsMenuOpen(false);

    // Slight delay to allow modal to close before opening native picker
    setTimeout(async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            "text/csv",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
          ],
          copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        setIsProcessingFile(true);
        const file = result.assets[0];

        const fileToUpload = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        };

        await uploadInventory(fileToUpload);
        showToast("Inventory imported successfully!", "success");
      } catch (err: any) {
        showToast(err.message || "Failed to import inventory", "error");
      } finally {
        setIsProcessingFile(false);
      }
    }, 300);
  };

  // ─── EXPORT LOGIC ─────────────────────────────────────────────────────────
  const handleExport = () => {
    setIsMenuOpen(false);

    setTimeout(async () => {
      setIsProcessingFile(true);
      try {
        const base64Data = await exportInventory();
        const filename = `VetriTrack_Inventory_${new Date().toISOString().split("T")[0]}.xlsx`;
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: "Save Inventory Export",
          });
        } else {
          showToast("Sharing is not available on this device", "error");
        }
      } catch (err: any) {
        showToast(err.message || "Failed to export inventory", "error");
      } finally {
        setIsProcessingFile(false);
      }
    }, 300);
  };

  const getStockStatus = (current: number, reorder: number) => {
    if (current <= reorder * 0.5) {
      return { label: "Critical", color: "#B91C1C", bg: "#FEE2E2" };
    } else if (current <= reorder) {
      return { label: "Low", color: "#C2410C", bg: "#FFEDD5" };
    } else {
      return { label: "In Stock", color: "#15803D", bg: "#DCFCE7" };
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Vaccine":
        return "#2563EB";
      case "Medication":
        return "#9333EA";
      case "Supplement":
        return "#16A34A";
      case "Treatment":
        return "#0D9488";
      case "Surgical":
        return "#EA580C";
      case "Diagnostic":
        return "#DB2777";
      default:
        return "#64748B";
    }
  };

  const RadioOption = ({ label, selected, onSelect }: any) => (
    <TouchableOpacity
      style={styles.radioRow}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.radioLabel, { fontFamily: Fonts?.sans }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

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

      {/* Processing Overlay */}
      {isProcessingFile && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#0891B2" />
          <Text style={styles.processingText}>Processing file...</Text>
        </View>
      )}

      {/* Header - Matches Figma gray-700 */}
      <View style={styles.headerWrapper}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleGroup}>
              <Package size={32} color="white" />
              <View style={{ flex: 1 }}>
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

            {/* Owner Actions Group */}
            {user?.role === "owner" && (
              <View style={styles.headerActions}>
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

                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setIsMenuOpen(true)}
                >
                  <MoreVertical size={20} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* Options Dropdown Modal (Owner Only) */}
      <Modal visible={isMenuOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
          <View style={styles.modalOverlayMenu}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleImport}
                >
                  <Upload size={18} color="#4B5563" />
                  <Text
                    style={[styles.menuItemText, { fontFamily: Fonts?.sans }]}
                  >
                    Import CSV / Excel
                  </Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleExport}
                >
                  <Download size={18} color="#4B5563" />
                  <Text
                    style={[styles.menuItemText, { fontFamily: Fonts?.sans }]}
                  >
                    Export to Excel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
            onPress={() => {
              setTempFilters(filters);
              setShowFilters(true);
            }}
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
            <RefreshControl
              refreshing={isLoading && !isProcessingFile}
              onRefresh={() => fetchItems(filters)}
            />
          }
          renderItem={({ item }) => {
            const currentStock = item.currentStock || 0;
            const status = getStockStatus(currentStock, item.minStockLevel);

            return (
              <TouchableOpacity
                style={styles.itemCard}
                activeOpacity={0.7}
                onPress={() =>
                  router.push(`/(tabs)/(inventory)/${item._id}` as any)
                }
              >
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

      {/* FILTER MODAL */}
      <Modal visible={showFilters} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { fontFamily: Fonts?.bold }]}>
                  Filter Inventory
                </Text>
                <Text
                  style={[styles.modalSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Filter and sort inventory items based on various criteria.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { fontFamily: Fonts?.bold },
                  ]}
                >
                  Stock Status
                </Text>
                <RadioOption
                  label="All"
                  selected={tempFilters.stockStatus === "all"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, stockStatus: "all" })
                  }
                />
                <RadioOption
                  label="Low Stock"
                  selected={tempFilters.stockStatus === "low-stock"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, stockStatus: "low-stock" })
                  }
                />
                <RadioOption
                  label="In Stock"
                  selected={tempFilters.stockStatus === "in-stock"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, stockStatus: "in-stock" })
                  }
                />
              </View>

              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { fontFamily: Fonts?.bold },
                  ]}
                >
                  Expiry Status
                </Text>
                <RadioOption
                  label="All"
                  selected={tempFilters.expiryStatus === "all"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, expiryStatus: "all" })
                  }
                />
                <RadioOption
                  label="Expiring Soon"
                  selected={tempFilters.expiryStatus === "expiring-soon"}
                  onSelect={() =>
                    setTempFilters({
                      ...tempFilters,
                      expiryStatus: "expiring-soon",
                    })
                  }
                />
                <RadioOption
                  label="Expired"
                  selected={tempFilters.expiryStatus === "expired"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, expiryStatus: "expired" })
                  }
                />
              </View>

              <View style={styles.filterSection}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { fontFamily: Fonts?.bold },
                  ]}
                >
                  Category
                </Text>
                <RadioOption
                  label="All"
                  selected={tempFilters.category === "all"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, category: "all" })
                  }
                />
                <RadioOption
                  label="Vaccine"
                  selected={tempFilters.category === "Vaccine"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, category: "Vaccine" })
                  }
                />
                <RadioOption
                  label="Medication"
                  selected={tempFilters.category === "Medication"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, category: "Medication" })
                  }
                />
                <RadioOption
                  label="Supplement"
                  selected={tempFilters.category === "Supplement"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, category: "Supplement" })
                  }
                />
                <RadioOption
                  label="Treatment"
                  selected={tempFilters.category === "Treatment"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, category: "Treatment" })
                  }
                />
                <RadioOption
                  label="Surgical"
                  selected={tempFilters.category === "Surgical"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, category: "Surgical" })
                  }
                />
                <RadioOption
                  label="Diagnostic"
                  selected={tempFilters.category === "Diagnostic"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, category: "Diagnostic" })
                  }
                />
              </View>

              <View style={[styles.filterSection, { borderBottomWidth: 0 }]}>
                <Text
                  style={[
                    styles.filterSectionTitle,
                    { fontFamily: Fonts?.bold },
                  ]}
                >
                  Sort By
                </Text>
                <RadioOption
                  label="Name A–Z"
                  selected={tempFilters.sort === "name-asc"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, sort: "name-asc" })
                  }
                />
                <RadioOption
                  label="Lowest On-hand"
                  selected={tempFilters.sort === "stock-asc"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, sort: "stock-asc" })
                  }
                />
                <RadioOption
                  label="Nearest Expiry"
                  selected={tempFilters.sort === "expiry-asc"}
                  onSelect={() =>
                    setTempFilters({ ...tempFilters, sort: "expiry-asc" })
                  }
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalClearBtn}
                onPress={handleClearFilters}
              >
                <Text
                  style={[
                    styles.modalClearBtnText,
                    { fontFamily: Fonts?.bold },
                  ]}
                >
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={handleApplyFilters}
              >
                <Text
                  style={[
                    styles.modalApplyBtnText,
                    { fontFamily: Fonts?.bold },
                  ]}
                >
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1, // 👈 Crucial: Tells the left side to fill space but respect boundaries
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    color: "white",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
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
  menuButton: { padding: 4 },

  // Dropdown Menu Styles
  modalOverlayMenu: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  dropdownMenu: {
    position: "absolute",
    top: 145,
    right: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuItemText: { fontSize: 15, color: "#374151" },
  menuDivider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 4 },

  // Processing Overlay Styles
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#0891B2",
    fontWeight: "600",
  },

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

  // MODAL STYLES (Filter)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    height: "85%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 22, color: "#111827", marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: "#6B7280" },
  modalScroll: { paddingHorizontal: 20 },

  filterSection: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterSectionTitle: { fontSize: 16, color: "#111827", marginBottom: 16 },

  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioOuterSelected: { borderColor: "#111827" },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#111827",
  },
  radioLabel: { fontSize: 15, color: "#111827" },

  modalFooter: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
    backgroundColor: "white",
  },
  modalClearBtn: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClearBtnText: { fontSize: 16, color: "#111827" },
  modalApplyBtn: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  modalApplyBtnText: { fontSize: 16, color: "white" },
});

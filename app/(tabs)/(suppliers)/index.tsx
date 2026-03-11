import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSupplierStore } from "@/store/useSupplierStore";
import { useRouter } from "expo-router";
import {
    Building2,
    Check,
    Clock,
    Mail,
    Plus,
    Search,
    X,
} from "lucide-react-native";
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

export default function SuppliersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { suppliers, fetchSuppliers, isLoading, error } = useSupplierStore();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Filter and sort logic (matching Figma)
  const displaySuppliers = useMemo(() => {
    // 1. Filter by search query (matching name or contact person)
    const filtered = suppliers.filter(
      (sup) =>
        sup.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.contactName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return filtered.sort((a, b) =>
      a.supplierName.localeCompare(b.supplierName),
    );
  }, [suppliers, searchQuery]);

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0891B2"
        translucent={false}
      />
      <Header
        title="Suppliers"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/")}
        onProfile={() => router.push("/profile" as any)}
      />
      {/* Header - Cyan 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#0891B2" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleGroup}>
              <Building2 size={28} color="white" />
              <View>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Suppliers
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {suppliers.length} registered suppliers
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                router.push("/(tabs)/(suppliers)/add-supplier" as any)
              }
            >
              <Plus size={16} color="#0891B2" />
              <Text
                style={[
                  styles.addButtonText,
                  { fontFamily: Fonts?.bold, color: "#0891B2" },
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentPad}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.textPrimary, fontFamily: Fonts?.sans },
            ]}
            placeholder="Search suppliers..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* List Content */}
        {isLoading && suppliers.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0891B2" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: theme.danger, marginBottom: 12 }}>
              {error}
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchSuppliers()}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={displaySuppliers}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchSuppliers}
                tintColor="#0891B2"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Building2
                  size={48}
                  color="#D1D5DB"
                  style={{ marginBottom: 12 }}
                />
                <Text style={[styles.emptyText, { fontFamily: Fonts?.sans }]}>
                  No suppliers found
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() =>
                  router.push(`/(tabs)/(suppliers)/${item._id}` as any)
                }
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.titleGroup}>
                    <Text
                      style={[styles.supplierName, { fontFamily: Fonts?.bold }]}
                    >
                      {item.supplierName}
                    </Text>
                    <Text
                      style={[styles.contactName, { fontFamily: Fonts?.sans }]}
                    >
                      {item.contactName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "Active"
                        ? styles.statusActiveBg
                        : styles.statusInactiveBg,
                    ]}
                  >
                    {item.status === "Active" ? (
                      <Check
                        size={12}
                        color="#15803D"
                        style={{ marginRight: 4 }}
                      />
                    ) : (
                      <X size={12} color="#374151" style={{ marginRight: 4 }} />
                    )}
                    <Text
                      style={[
                        styles.statusText,
                        item.status === "Active"
                          ? styles.statusActiveText
                          : styles.statusInactiveText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.emailRow}>
                  <Mail size={14} color="#4B5563" />
                  <Text
                    style={[styles.emailText, { fontFamily: Fonts?.sans }]}
                    numberOfLines={1}
                  >
                    {item.email}
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  <View style={styles.leadTimeBadge}>
                    <Clock
                      size={12}
                      color="#1D4ED8"
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[styles.leadTimeText, { fontFamily: Fonts?.sans }]}
                    >
                      Avg lead time: {item.leadTimeNotes || "N/A"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { paddingBottom: 16 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: 20, color: "white" },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  addButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: { fontSize: 14, marginLeft: 4 },

  contentPad: { flex: 1, padding: 16 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },

  listContent: { paddingBottom: 80, gap: 12 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleGroup: { flex: 1, paddingRight: 12 },
  supplierName: { fontSize: 16, color: "#111827", marginBottom: 4 },
  contactName: { fontSize: 14, color: "#4B5563" },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusActiveBg: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  statusActiveText: { color: "#15803D", fontSize: 11, fontWeight: "600" },
  statusInactiveBg: { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" },
  statusInactiveText: { color: "#374151", fontSize: 11, fontWeight: "600" },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  emailText: { fontSize: 14, color: "#4B5563", flex: 1 },

  badgeRow: { flexDirection: "row" },
  leadTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leadTimeText: { fontSize: 12, color: "#1D4ED8" },
  statusText: { fontSize: 11, fontWeight: "600" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  retryBtn: {
    backgroundColor: "#0891B2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#6B7280", fontSize: 15 },
});

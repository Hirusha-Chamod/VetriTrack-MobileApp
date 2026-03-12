import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePurchaseOrderStore } from "@/store/usePurchaseOrderStore";
import { useSupplierStore } from "@/store/useSupplierStore";
import { useRouter } from "expo-router";
import {
    Building2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Package,
    Plus,
} from "lucide-react-native";
import React, { useEffect } from "react";
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

export default function DraftPOsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { drafts, fetchDrafts, isLoading, error } = usePurchaseOrderStore();

  const { suppliers } = useSupplierStore();

  useEffect(() => {
    fetchDrafts();
  }, []);

  const renderDraftCard = ({ item: draft }: any) => {
    let supplierName = "Unknown Supplier";

    if (typeof draft.supplierId === "object" && draft.supplierId !== null) {
      supplierName = draft.supplierId.supplierName;
    } else if (typeof draft.supplierId === "string") {
      const foundSupplier = suppliers.find((s) => s._id === draft.supplierId);
      if (foundSupplier) supplierName = foundSupplier.supplierName;
    }
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          router.push(`/(tabs)/(purchase-orders)/draft/${draft._id}` as any)
        }
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.supplierTitleRow}>
                <Building2
                  size={20}
                  color="#9333EA"
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[styles.supplierName, { fontFamily: Fonts?.bold }]}
                >
                  {supplierName}
                </Text>
              </View>
              <View style={styles.itemCountRow}>
                <Package size={16} color="#6B7280" style={{ marginRight: 6 }} />
                <Text style={styles.itemCountText}>
                  {draft.items.length} items
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#9CA3AF" style={{ marginTop: 4 }} />
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Total Value:</Text>
              <Text
                style={[
                  styles.footerValue,
                  { color: "#7E22CE", fontFamily: Fonts?.bold },
                ]}
              >
                LKR {draft.totalValue.toLocaleString()}
              </Text>
            </View>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Last Updated:</Text>
              <Text style={[styles.footerValue, { fontFamily: Fonts?.bold }]}>
                {new Date(draft.updatedAt).toLocaleDateString("en-GB", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#9333EA"
        translucent={false}
      />

      {/* Header - Purple 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#9333EA" }]}>
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
              <FileText size={28} color="white" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Draft POs
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {drafts.length} draft purchase orders
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                router.push("/(tabs)/(purchase-orders)/add-item" as any)
              }
            >
              <Plus size={16} color="#9333EA" />
              <Text style={[styles.addButtonText, { fontFamily: Fonts?.bold }]}>
                New
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentPad}>
        {/* Helper Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>
            Each supplier has their own draft PO. Approved requests are
            automatically added here. Review and confirm to send to suppliers.
          </Text>
        </View>

        {isLoading && drafts.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#9333EA" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: theme.danger, marginBottom: 12 }}>
              {error}
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: "#9333EA",
                padding: 12,
                borderRadius: 6,
              }}
              onPress={() => fetchDrafts()}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={drafts}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={() => fetchDrafts()}
                tintColor="#9333EA"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconBg}>
                  <FileText size={32} color="#9CA3AF" />
                </View>
                <Text style={[styles.emptyTitle, { fontFamily: Fonts?.bold }]}>
                  No Draft POs
                </Text>
                <Text style={[styles.emptyText, { fontFamily: Fonts?.sans }]}>
                  Approve staff requests to create draft POs
                </Text>
              </View>
            }
            renderItem={renderDraftCard}
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
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backBtn: { paddingRight: 8, paddingTop: 2 },
  headerTitleGroup: { flex: 1, flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 20, color: "white", marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.9)" },
  addButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: { color: "#9333EA", fontSize: 14, marginLeft: 4 },

  contentPad: { flex: 1, padding: 16 },

  infoBox: {
    backgroundColor: "#FAF5FF",
    borderColor: "#E9D5FF",
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBoxText: { color: "#581C87", fontSize: 13, lineHeight: 20 },

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
  supplierTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  supplierName: { fontSize: 16, color: "#111827" },
  itemCountRow: { flexDirection: "row", alignItems: "center" },
  itemCountText: { fontSize: 14, color: "#4B5563" },

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
  emptyTitle: { fontSize: 18, color: "#111827", marginBottom: 8 },
  emptyText: { color: "#6B7280", fontSize: 14 },
});

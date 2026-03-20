import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useRouter } from "expo-router";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  Edit3,
  History,
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

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { transactions, fetchTransactions, isLoading } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getTransactionUI = (type: string) => {
    switch (type) {
      case "RECEIVE":
        return {
          icon: ArrowDownRight,
          color: "#16A34A",
          bg: "#DCFCE7",
          prefix: "+",
        };
      case "ISSUE":
        return {
          icon: ArrowUpRight,
          color: "#2563EB",
          bg: "#DBEAFE",
          prefix: "-",
        };
      case "ADJUSTMENT":
        return { icon: Edit3, color: "#EA580C", bg: "#FFEDD5", prefix: "" }; // Prefix depends on qty
      default:
        return { icon: History, color: "#4B5563", bg: "#F3F4F6", prefix: "" };
    }
  };

  const renderTransaction = ({ item }: any) => {
    const ui = getTransactionUI(item.type);
    const Icon = ui.icon;

    // The backend populates the itemId, so we can grab the itemName
    const itemName =
      typeof item.itemId === "object" ? item.itemId.itemName : "Unknown Item";

    // Format quantity (e.g. +50, -5)
    let displayQty = `${ui.prefix}${item.quantity}`;
    let qtyColor = "#111827";

    if (
      item.type === "RECEIVE" ||
      (item.type === "ADJUSTMENT" && item.quantity > 0)
    ) {
      displayQty = `+${Math.abs(item.quantity)}`;
      qtyColor = "#16A34A"; // Green
    } else if (
      item.type === "ISSUE" ||
      (item.type === "ADJUSTMENT" && item.quantity < 0)
    ) {
      displayQty = `-${Math.abs(item.quantity)}`;
      qtyColor = "#DC2626"; // Red
    }

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() =>
          router.push(`/(tabs)/(transactions)/(history)/${item._id}` as any)
        }
      >
        <View style={[styles.iconBox, { backgroundColor: ui.bg }]}>
          <Icon size={20} color={ui.color} />
        </View>
        <View style={styles.cardMiddle}>
          <Text style={[styles.itemName, { fontFamily: Fonts?.bold }]}>
            {itemName}
          </Text>
          <Text style={styles.reasonText} numberOfLines={1}>
            {item.reason}
          </Text>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <Text
            style={[
              styles.qtyText,
              { color: qtyColor, fontFamily: Fonts?.bold },
            ]}
          >
            {displayQty}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#475569"
        translucent={false}
      />

      {/* Header - Slate 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#475569" }]}>
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
              <View style={styles.headerIconBg}>
                <History size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Transaction History
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  Audit log of all movements
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {isLoading && transactions.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#475569" />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchTransactions}
              tintColor="#475569"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <History size={32} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No history yet</Text>
              <Text style={styles.emptyText}>
                Transactions will appear here once recorded.
              </Text>
            </View>
          }
          renderItem={renderTransaction}
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
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: { paddingRight: 8, paddingTop: 2 },
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

  listContent: { padding: 16, paddingBottom: 40 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardMiddle: { flex: 1, marginRight: 12 },
  itemName: { fontSize: 15, color: "#111827", marginBottom: 2 },
  reasonText: { fontSize: 13, color: "#4B5563", marginBottom: 4 },
  dateText: { fontSize: 11, color: "#9CA3AF" },
  cardRight: { alignItems: "flex-end" },
  qtyText: { fontSize: 18 },

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

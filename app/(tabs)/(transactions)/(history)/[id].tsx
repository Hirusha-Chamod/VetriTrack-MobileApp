import { Colors, Fonts } from "@/constants/theme";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowDownRight,
    ArrowUpRight,
    Calendar,
    ChevronLeft,
    Clock,
    Edit3,
    FileText,
    Hash,
    History,
    Package,
    User,
} from "lucide-react-native";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];

  const { transactions } = useTransactionStore();
  const transaction = transactions.find((t) => t._id === id);

  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
        <View style={[styles.headerWrapper, { backgroundColor: "#475569" }]}>
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <ChevronLeft size={28} color="white" />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Transaction Not Found
              </Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  // --- Extract Data Safely ---
  const itemName =
    typeof transaction.itemId === "object"
      ? transaction.itemId.itemName
      : "Unknown Item";
  const category =
    typeof transaction.itemId === "object"
      ? transaction.itemId.category
      : "Unknown Category";

  // Performed By could be an object or a string depending on your populate()
  const performedBy =
    typeof transaction.performedBy === "object"
      ? transaction.performedBy
      : transaction.performedBy || "System / Unknown User";

  // --- UI Helpers ---
  const getTransactionUI = (type: string) => {
    switch (type) {
      case "RECEIVE":
        return {
          icon: ArrowDownRight,
          color: "#16A34A",
          bg: "#DCFCE7",
          label: "Stock Received",
          prefix: "+",
        };
      case "ISSUE":
        return {
          icon: ArrowUpRight,
          color: "#2563EB",
          bg: "#DBEAFE",
          label: "Stock Issued",
          prefix: "-",
        };
      case "ADJUSTMENT":
        return {
          icon: Edit3,
          color: "#EA580C",
          bg: "#FFEDD5",
          label: "Stock Adjustment",
          prefix: "",
        };
      default:
        return {
          icon: History,
          color: "#4B5563",
          bg: "#F3F4F6",
          label: "Unknown",
          prefix: "",
        };
    }
  };

  const ui = getTransactionUI(transaction.type);
  const Icon = ui.icon;

  let displayQty = `${ui.prefix}${transaction.quantity}`;
  let qtyColor = "#111827";

  if (
    transaction.type === "RECEIVE" ||
    (transaction.type === "ADJUSTMENT" && transaction.quantity > 0)
  ) {
    displayQty = `+${Math.abs(transaction.quantity)}`;
    qtyColor = "#16A34A";
  } else if (
    transaction.type === "ISSUE" ||
    (transaction.type === "ADJUSTMENT" && transaction.quantity < 0)
  ) {
    displayQty = `-${Math.abs(transaction.quantity)}`;
    qtyColor = "#DC2626";
  }

  const txDate = new Date(transaction.createdAt);

  const InfoRow = ({
    icon: RowIcon,
    label,
    value,
    valueColor = "#111827",
  }: any) => (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <RowIcon size={18} color="#6B7280" style={{ marginRight: 12 }} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text
        style={[
          styles.infoValue,
          { color: valueColor, fontFamily: Fonts?.bold },
        ]}
      >
        {value}
      </Text>
    </View>
  );

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
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Transaction Details
              </Text>
            </View>
            <View style={{ width: 28 }} /> {/* Spacer to center title */}
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentPad}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Summary Card */}
        <View style={styles.heroCard}>
          <View style={[styles.heroIconBg, { backgroundColor: ui.bg }]}>
            <Icon size={32} color={ui.color} />
          </View>
          <Text
            style={[
              styles.heroQty,
              { color: qtyColor, fontFamily: Fonts?.bold },
            ]}
          >
            {displayQty} Units
          </Text>
          <Text style={styles.heroItemName}>{itemName}</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>{ui.label}</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
          Transaction Data
        </Text>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <InfoRow icon={Package} label="Item Category" value={category} />
          <InfoRow
            icon={FileText}
            label="Reason / Notes"
            value={transaction.reason || "No notes provided"}
          />
          <InfoRow
            icon={Calendar}
            label="Date"
            value={txDate.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
          <InfoRow
            icon={Clock}
            label="Time"
            value={txDate.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <InfoRow icon={User} label="Performed By" value={performedBy} />
        </View>

        {/* System Info */}
        <Text
          style={[
            styles.sectionTitle,
            { fontFamily: Fonts?.bold, marginTop: 8 },
          ]}
        >
          System Reference
        </Text>
        <View style={styles.detailsCard}>
          <InfoRow
            icon={Hash}
            label="Transaction ID"
            value={transaction._id}
            valueColor="#6B7280"
          />
          {transaction.batchId && (
            <InfoRow
              icon={Hash}
              label="Target Batch ID"
              value={transaction.batchId}
              valueColor="#6B7280"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerWrapper: { paddingBottom: 16 },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backBtn: { paddingRight: 8, paddingTop: 2 },
  headerTitleGroup: { alignItems: "center" },
  headerTitle: { fontSize: 20, color: "white" },

  contentPad: { padding: 16, paddingBottom: 40 },

  heroCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  heroIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  heroQty: { fontSize: 32, marginBottom: 4 },
  heroItemName: { fontSize: 16, color: "#4B5563", marginBottom: 12 },
  heroBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroBadgeText: { fontSize: 12, color: "#4B5563", fontWeight: "600" },

  sectionTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  detailsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 16,
  },
  infoLabel: { fontSize: 14, color: "#4B5563" },
  infoValue: { fontSize: 14, textAlign: "right", flex: 1.5, lineHeight: 20 },
});

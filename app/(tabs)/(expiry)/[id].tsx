import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ExpiryReportItem, inventoryApi } from "@/services/inventoryService";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    AlertTriangle,
    ArrowLeft,
    Calendar,
    FileText,
    MoreVertical,
    Package,
    XCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function BatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
 const colorScheme = 'light';
  const theme = Colors[colorScheme];

  const { items: inventoryItems } = useInventoryStore();
  const [batchData, setBatchData] = useState<ExpiryReportItem | null>(null);
  const [isExpired, setIsExpired] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchBatchDetails = async () => {
      setIsLoading(true);
      try {
        const report = await inventoryApi.getExpiryReport();

        // 1. Check if it's in the expired list
        const expiredItem = report.expired.find((b) => b.batchId === id);
        if (expiredItem) {
          setBatchData(expiredItem);
          setIsExpired(true);
          return;
        }

        // 2. If not, check if it's in the expiring soon list
        const expiringItem = report.expiringSoon.find((b) => b.batchId === id);
        if (expiringItem) {
          setBatchData(expiringItem);
          setIsExpired(false);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch batch detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchDetails();
  }, [id]);

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: "#F9FAFB" }]}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!batchData) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: "#F9FAFB" }]}>
        <Text style={{ fontFamily: Fonts?.bold, fontSize: 18 }}>
          Batch not found
        </Text>
        <TouchableOpacity
          style={{ marginTop: 16 }}
          onPress={() => router.back()}
        >
          <Text style={{ color: "#2563EB" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Find category from inventory store
  const matchedItem = inventoryItems.find(
    (i) => i.itemCode === batchData.itemCode,
  );
  const category = matchedItem?.category || "Unknown Category";

  // Dynamic Theme Colors based on Status
  const themeColors = {
    primary: isExpired ? "#DC2626" : "#D97706", // Red vs Amber
    lightBg: isExpired ? "#FEF2F2" : "#FFF7ED", // Red 50 vs Amber 50
    darkText: isExpired ? "#991B1B" : "#92400E", // Red 800 vs Amber 800
    icon: isExpired ? XCircle : AlertTriangle,
    headerTitle: isExpired ? "Expired Batch Detail" : "Expiring Batch Detail",
    heroTitle: isExpired ? "Expired Batch" : "Expiring Soon",
    badgeText: isExpired
      ? `Expired ${batchData.daysExpired} days ago`
      : `Expires in ${batchData.daysUntilExpiry} days`,
    actionTitle: isExpired ? "Action Required" : "Warning",
    actionDesc: isExpired
      ? "This batch has expired and must be removed from active inventory. Record disposal to adjust stock levels."
      : "This batch is expiring soon. Consider discounting, using it first, or preparing for disposal.",
    btnText: isExpired ? "Record Disposal" : "Adjust Stock",
  };

  const HeaderIcon = themeColors.icon;

  const handlePrimaryAction = () => {
    // Navigate to Adjust screen and pass all the context as URL parameters
    router.push({
      pathname: "/(tabs)/(transactions)/adjust",
      params: {
        prefillItemId: matchedItem?._id, 
        prefillBatchId: batchData._id, 
        prefillQty: batchData.quantity.toString(), 
        prefillType: "remove", 
        prefillReason: isExpired ? "expired-disposed" : "other", 
        prefillNotes: notes
          ? `[Batch: ${batchData.batchId}] ${notes}` // Keep .batchId here for human readable notes!
          : `[Batch: ${batchData.batchId}]`,
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F9FAFB" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={false}
      />

      {/* Top Header */}
      <SafeAreaView style={{ backgroundColor: "white" }}>
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginRight: 16 }}
            >
              <ArrowLeft size={24} color="#2563EB" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
              {themeColors.headerTitle}
            </Text>
          </View>
          <TouchableOpacity>
            <MoreVertical size={24} color="#4B5563" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Hero Section */}
        <View
          style={[styles.heroSection, { backgroundColor: themeColors.primary }]}
        >
          <View style={styles.heroIconBox}>
            <HeaderIcon size={24} color="white" />
          </View>
          <View>
            <Text style={[styles.heroTitle, { fontFamily: Fonts?.bold }]}>
              {themeColors.heroTitle}
            </Text>
            <View style={styles.heroBadge}>
              <Text style={[styles.heroBadgeText, { fontFamily: Fonts?.bold }]}>
                {themeColors.badgeText}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Required Banner */}
        <View style={styles.contentPadding}>
          <View
            style={[
              styles.actionBanner,
              {
                backgroundColor: themeColors.lightBg,
                borderLeftColor: themeColors.primary,
              },
            ]}
          >
            <View style={styles.actionBannerTop}>
              <HeaderIcon
                size={16}
                color={themeColors.darkText}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.actionBannerTitle,
                  { color: themeColors.darkText, fontFamily: Fonts?.bold },
                ]}
              >
                {themeColors.actionTitle}
              </Text>
            </View>
            <Text
              style={[styles.actionBannerDesc, { color: themeColors.darkText }]}
            >
              {themeColors.actionDesc}
            </Text>
          </View>

          {/* Item Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Package size={20} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
                Item Information
              </Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Item Name</Text>
                <Text style={[styles.infoValue, { fontFamily: Fonts?.bold }]}>
                  {batchData.product}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={[styles.infoValue, { fontFamily: Fonts?.bold }]}>
                  {category}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>Unit</Text>
                <Text style={[styles.infoValue, { fontFamily: Fonts?.bold }]}>
                  {batchData.unit}
                </Text>
              </View>
            </View>
          </View>

          {/* Batch Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Calendar size={20} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
                Batch Details
              </Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Batch ID</Text>
                <Text style={styles.infoValue}>{batchData.batchId}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Current Quantity</Text>
                <Text
                  style={[
                    styles.infoValue,
                    { fontSize: 16, fontFamily: Fonts?.bold },
                  ]}
                >
                  {batchData.quantity} {batchData.unit}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Supplier</Text>
                <Text style={[styles.infoValue, { fontFamily: Fonts?.bold }]}>
                  {batchData.supplier}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expiry Date</Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: themeColors.primary, fontFamily: Fonts?.bold },
                  ]}
                >
                  {new Date(batchData.expiryDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              </View>
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>
                  {isExpired ? "Days Expired" : "Time Left"}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: themeColors.primary, fontFamily: Fonts?.bold },
                  ]}
                >
                  {themeColors.badgeText}
                </Text>
              </View>
            </View>
          </View>

          {/* Disposal Notes Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <FileText size={20} color="#4B5563" style={{ marginRight: 8 }} />
              <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
                Disposal Notes (Optional)
              </Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.notesInstruction}>
                Add any relevant notes about the disposal
              </Text>
              <TextInput
                style={styles.notesInput}
                placeholder="e.g., Physical condition, disposal method, witness name..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
              />
            </View>
          </View>

          {/* Info Note */}
          <View style={styles.infoNoteBox}>
            <Text style={styles.infoNoteText}>
              <Text style={{ fontFamily: Fonts?.bold }}>Note: </Text>
              Clicking "{themeColors.btnText}" will take you to the Stock
              Adjustment screen with pre-filled information. Review and submit
              to complete the record.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
          onPress={handlePrimaryAction}
          activeOpacity={0.8}
        >
          <HeaderIcon size={18} color="white" style={{ marginRight: 8 }} />
          <Text style={[styles.primaryBtnText, { fontFamily: Fonts?.bold }]}>
            {themeColors.btnText}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={[styles.cancelBtnText, { fontFamily: Fonts?.bold }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 18, color: "#111827" },

  scrollContent: { paddingBottom: 140 },

  heroSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  heroTitle: { color: "white", fontSize: 20, marginBottom: 8 },
  heroBadge: {
    backgroundColor: "rgba(0,0,0,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  heroBadgeText: { color: "white", fontSize: 12 },

  contentPadding: { padding: 16 },

  actionBanner: {
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  actionBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  actionBannerTitle: { fontSize: 14 },
  actionBannerDesc: { fontSize: 13, lineHeight: 20 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  cardTitle: { fontSize: 16, color: "#111827" },
  cardBody: { padding: 16 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 14, color: "#6B7280" },
  infoValue: { fontSize: 15, color: "#111827" },

  notesInstruction: { fontSize: 13, color: "#4B5563", marginBottom: 12 },
  notesInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 80,
  },

  infoNoteBox: {
    backgroundColor: "#EFF6FF", // Blue 50
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoNoteText: { color: "#1E3A8A", fontSize: 13, lineHeight: 20 }, // Blue 900

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontSize: 16 },
  cancelBtn: {
    height: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelBtnText: { color: "#374151", fontSize: 16 },
});

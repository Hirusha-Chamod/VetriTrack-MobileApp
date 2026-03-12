import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useToastStore } from "@/store/useToastStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { useRouter } from "expo-router";
import {
    ChevronLeft,
    ChevronRight,
    Info,
    Package,
    Search,
    Upload
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
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

const ISSUE_REASONS = [
  { id: "treatment", label: "Treatment/Procedure" },
  { id: "dispensed", label: "Dispensed to Client" },
  { id: "internal", label: "Internal Use" },
  { id: "sample", label: "Sample/Demo" },
];

export default function IssueStockScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const { items, fetchItems } = useInventoryStore();
  const { processTransaction, isLoading } = useTransactionStore();

  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [reason, setReason] = useState<string>("treatment");
  const [notes, setNotes] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (items.length === 0) fetchItems();
  }, []);

  const filteredItems = items.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedItem = items.find((i) => i._id === selectedItemId);

  const handleIssueSubmit = async () => {
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }

    try {
      const reasonLabel =
        ISSUE_REASONS.find((r) => r.id === reason)?.label || reason;
      const fullReason = notes ? `${reasonLabel} - ${notes}` : reasonLabel;

      await processTransaction({
        itemId: selectedItemId,
        type: "ISSUE",
        quantity: qty,
        reason: fullReason,
        // Notice we purposely omit batchId here!
        // Your backend will catch this and apply the FEFO logic automatically.
      });

      showToast("Stock issued successfully via FEFO!", "success");
      router.back();
    } catch (error: any) {
      // If the backend throws 'Insufficient stock', it will be caught here!
      showToast(error.message || "Failed to issue stock", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#F9FAFB" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
        translucent={false}
      />

      {/* Header - Blue 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
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
                <Upload size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Issue Stock
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  FEFO Auto-Allocation
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentPad}>
        {!selectedItemId ? (
          /* STEP 1: Select Item */
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                Search and select an item to issue. The system will
                automatically use the earliest expiring batches first.
              </Text>
            </View>

            <View style={styles.searchContainer}>
              <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search inventory items..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.7}
                  onPress={() => setSelectedItemId(item._id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}
                    >
                      {item.itemName}
                    </Text>
                    <Text style={styles.cardSub}>
                      {item.category} • {item.unitOfMeasure}
                    </Text>
                  </View>
                  <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            />
          </>
        ) : (
          /* STEP 2: Issue Details */
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {/* Selected Item Context */}
            <View style={styles.selectedContextCard}>
              <View style={styles.contextRow}>
                <Package
                  size={20}
                  color="#2563EB"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.contextLabel}>Selected Item</Text>
                  <Text
                    style={[styles.contextValue, { fontFamily: Fonts?.bold }]}
                  >
                    {selectedItem?.itemName}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedItemId("")}
                  style={styles.changeBtn}
                >
                  <Text style={styles.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quantity Input */}
            <View style={styles.detailCard}>
              <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
                Quantity to Issue ({selectedItem?.unitOfMeasure})
              </Text>
              <View style={styles.qtyControlBox}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    setQuantity((prev) =>
                      Math.max(1, parseInt(prev || "1") - 1).toString(),
                    )
                  }
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.qtyInput}
                  value={quantity}
                  keyboardType="numeric"
                  onChangeText={setQuantity}
                  placeholder="1"
                />
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    setQuantity((prev) =>
                      (parseInt(prev || "0") + 1).toString(),
                    )
                  }
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* FEFO Info Box */}
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: "#F0FDF4",
                  borderColor: "#BBF7D0",
                  flexDirection: "row",
                  alignItems: "flex-start",
                },
              ]}
            >
              <Info
                size={18}
                color="#16A34A"
                style={{ marginTop: 2, marginRight: 8 }}
              />
              <Text style={[styles.infoBoxText, { color: "#166534", flex: 1 }]}>
                <Text style={{ fontWeight: "bold" }}>FEFO Active:</Text> The
                backend will automatically deduct this quantity from the batches
                with the closest expiry dates.
              </Text>
            </View>

            {/* Reason Selection */}
            <View style={styles.detailCard}>
              <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
                Reason for Issue
              </Text>
              <View style={styles.chipContainer}>
                {ISSUE_REASONS.map((r) => (
                  <TouchableOpacity
                    key={r.id}
                    style={[styles.chip, reason === r.id && styles.chipActive]}
                    onPress={() => setReason(r.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        reason === r.id && styles.chipTextActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text
                style={[
                  styles.sectionTitle,
                  { fontFamily: Fonts?.bold, marginTop: 20 },
                ]}
              >
                Notes (Optional)
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="e.g., Patient name, treatment details..."
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        )}
      </View>

      {/* Bottom Action Bar */}
      {selectedItemId && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!quantity || parseInt(quantity) <= 0) && { opacity: 0.5 },
            ]}
            onPress={handleIssueSubmit}
            disabled={!quantity || parseInt(quantity) <= 0 || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Upload size={20} color="white" style={{ marginRight: 8 }} />
                <Text
                  style={[styles.submitBtnText, { fontFamily: Fonts?.bold }]}
                >
                  Confirm Issue
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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

  contentPad: { flex: 1, padding: 16 },

  infoBox: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoBoxText: { color: "#1E3A8A", fontSize: 13, lineHeight: 20 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },

  card: {
    flexDirection: "row",
    alignItems: "center",
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
  cardTitle: { fontSize: 16, color: "#111827", marginBottom: 4 },
  cardSub: { fontSize: 13, color: "#6B7280" },

  selectedContextCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  contextRow: { flexDirection: "row", alignItems: "center" },
  contextLabel: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  contextValue: { fontSize: 15, color: "#111827" },
  changeBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeBtnText: { fontSize: 12, color: "#374151", fontWeight: "500" },

  detailCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, color: "#111827", marginBottom: 12 },

  qtyControlBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  qtyBtn: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  qtyBtnText: { fontSize: 24, color: "#374151" },
  qtyInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    textAlign: "center",
    marginHorizontal: 12,
    fontSize: 18,
    backgroundColor: "white",
  },

  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  chipActive: { backgroundColor: "#EFF6FF", borderColor: "#2563EB" },
  chipText: { fontSize: 13, color: "#4B5563" },
  chipTextActive: { color: "#2563EB", fontWeight: "600" },

  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    height: 100,
    backgroundColor: "white",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  submitBtn: {
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { color: "white", fontSize: 16 },
});

import { Colors, Fonts } from "@/constants/theme";
import { useInventoryStore } from "@/store/useInventoryStore";
import { usePurchaseOrderStore } from "@/store/usePurchaseOrderStore";
import { useToastStore } from "@/store/useToastStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { safeGoBack } from "@/utils/navigation";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Calendar,
    ChevronLeft,
    Download,
    FileText,
    Hash,
    Package,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
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

export default function ReceiveLineItemScreen() {
  const { poId, itemId } = useLocalSearchParams<{
    poId: string;
    itemId: string;
  }>();
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const { purchaseOrders, receivePoItems } = usePurchaseOrderStore();
  const { processTransaction, isLoading: isTxLoading } = useTransactionStore();
  const { items: inventoryItems } = useInventoryStore();

  // Find PO and Item
  const po = purchaseOrders.find((p) => p._id === poId);
  const poItem = po?.items.find((i) => {
    const iIdStr =
      typeof i.itemId === "object" ? (i.itemId as any)._id : i.itemId;
    return iIdStr === itemId;
  });

  const remaining = poItem
    ? poItem.quantityRequested - poItem.quantityReceived
    : 0;

  const [quantityReceived, setQuantityReceived] = useState<string>(
    remaining.toString(),
  );
  const [batchLotNumber, setBatchLotNumber] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Date Picker State
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    // Reset all inputs whenever we navigate to a new PO or Item
    setQuantityReceived(remaining.toString());
    setBatchLotNumber("");
    setExpiryDate("");
    setNotes("");
    setErrors({});
    setDate(new Date());
  }, [poId, itemId, remaining]);

  if (!po || !poItem) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: theme.background }]}
      >
        <Text style={{ fontFamily: Fonts?.bold }}>Item not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 12 }}
        >
          <Text style={{ color: "#16A34A" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fallback Name
  let itemName = "Unknown Item";
  if (typeof poItem.itemId === "object" && poItem.itemId !== null) {
    itemName = (poItem.itemId as any).itemName;
  } else if (typeof poItem.itemId === "string") {
    const foundItem = inventoryItems.find((i) => i._id === poItem.itemId);
    if (foundItem) itemName = foundItem.itemName;
  }

  const supplierName =
    typeof po.supplierId === "object"
      ? (po.supplierId as any).supplierName
      : "Unknown Supplier";

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false); // Android picker closes automatically
    }
    if (selectedDate) {
      setDate(selectedDate);
      // Format as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split("T")[0];
      setExpiryDate(formattedDate);
      setErrors({ ...errors, expiryDate: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const qty = parseInt(quantityReceived);

    if (!qty || qty <= 0)
      newErrors.quantity = "Quantity must be greater than 0";
    if (qty > remaining)
      newErrors.quantity = `Cannot exceed remaining quantity (${remaining})`;
    if (!batchLotNumber.trim())
      newErrors.batchLotNumber = "Batch/Lot number is required";
    if (!expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const qty = parseInt(quantityReceived);

    try {
      const actualSupplierId =
        typeof po.supplierId === "object"
          ? (po.supplierId as any)._id
          : po.supplierId;

      await processTransaction({
        itemId: itemId,
        supplierId: actualSupplierId,
        type: "RECEIVE",
        quantity: qty,
        reason: `PO Receipt: ${po.poNumber} (Batch: ${batchLotNumber.trim()})`,
        batchLotNumber: batchLotNumber.trim(),
        expiryDate: expiryDate,
      });

      await receivePoItems(poId, itemId, qty);

      showToast(`Successfully received ${qty} units!`, "success");
      safeGoBack(router, "/(tabs)/(transactions)/receive");
    } catch (error: any) {
      showToast(error.message || "Failed to receive item", "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#F9FAFB" }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="#16A34A"
        translucent={false}
      />

      {/* Header */}
      <View style={[styles.headerWrapper, { backgroundColor: "#16A34A" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() =>
                safeGoBack(router, "/(tabs)/(transactions)/receive")
              }
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconBg}>
                <Download size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Receive Line Item
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {po.poNumber} • {supplierName}
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Item Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Package size={20} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              Item Details
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Item Name</Text>
              <Text style={styles.infoValue}>{itemName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ordered Quantity</Text>
              <Text style={styles.infoValue}>{poItem.quantityRequested}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Already Received</Text>
              <Text style={[styles.infoValue, { color: "#16A34A" }]}>
                {poItem.quantityReceived}
              </Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Remaining to Receive</Text>
              <Text style={[styles.infoValue, { color: "#EA580C" }]}>
                {remaining}
              </Text>
            </View>
          </View>
        </View>

        {/* Quantity Input */}
        <View style={styles.card}>
          <View style={styles.cardBody}>
            <Text style={styles.inputLabel}>
              Quantity Received <Text style={{ color: "#DC2626" }}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.quantity && styles.inputError]}
              value={quantityReceived}
              onChangeText={(t) => {
                setQuantityReceived(t);
                setErrors({ ...errors, quantity: "" });
              }}
              keyboardType="numeric"
            />
            {errors.quantity ? (
              <Text style={styles.errorText}>{errors.quantity}</Text>
            ) : (
              <Text style={styles.helperText}>Maximum: {remaining} units</Text>
            )}
          </View>
        </View>

        {/* Batch Information */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Hash size={20} color="#EA580C" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              Batch Information
            </Text>
          </View>
          <View style={styles.cardBody}>
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.inputLabel}>
                Batch/Lot Number <Text style={{ color: "#DC2626" }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.batchLotNumber && styles.inputError,
                ]}
                placeholder="e.g., LOT-2026-001"
                value={batchLotNumber}
                onChangeText={(t) => {
                  setBatchLotNumber(t);
                  setErrors({ ...errors, batchLotNumber: "" });
                }}
              />
              {errors.batchLotNumber && (
                <Text style={styles.errorText}>{errors.batchLotNumber}</Text>
              )}
            </View>

            {/* EXPIRY DATE PICKER */}
            <View>
              <Text style={styles.inputLabel}>
                Expiry Date <Text style={{ color: "#DC2626" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.dateInputWrapper,
                  errors.expiryDate && styles.inputError,
                ]}
                activeOpacity={0.7}
                onPress={() => setShowDatePicker(true)}
              >
                <Calendar size={20} color="#9CA3AF" style={styles.inputIcon} />
                <Text
                  style={{
                    color: expiryDate ? "#111827" : "#9CA3AF",
                    fontSize: 15,
                  }}
                >
                  {expiryDate || "Select expiry date"}
                </Text>
              </TouchableOpacity>
              {errors.expiryDate && (
                <Text style={styles.errorText}>{errors.expiryDate}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Storage Notes */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FileText size={20} color="#4B5563" style={{ marginRight: 8 }} />
            <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
              Storage Notes (Optional)
            </Text>
          </View>
          <View style={styles.cardBody}>
            <TextInput
              style={styles.textArea}
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g., Stored in refrigerator, special handling notes..."
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={isTxLoading}
        >
          {isTxLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Download size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.submitBtnText, { fontFamily: Fonts?.bold }]}>
                Confirm Receipt
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Cross-Platform Date Picker Implementation */}
      {showDatePicker && Platform.OS === "ios" && (
        <Modal transparent animationType="slide">
          <View style={styles.iosPickerModal}>
            <View style={styles.iosPickerContent}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.iosPickerDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()} // Prevents picking dates in the past
              />
            </View>
          </View>
        </Modal>
      )}
      {showDatePicker && Platform.OS === "android" && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
          minimumDate={new Date()}
        />
      )}
    </KeyboardAvoidingView>
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

  scrollContent: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 14, color: "#4B5563" },
  infoValue: { fontSize: 14, color: "#111827", fontWeight: "500" },

  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
  },
  dateInputWrapper: {
    justifyContent: "center",
    paddingLeft: 44,
  },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },
  helperText: { color: "#6B7280", fontSize: 12, marginTop: 4 },

  inputIcon: { position: "absolute", left: 12, zIndex: 1 },

  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    height: 100,
    backgroundColor: "#F9FAFB",
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
    backgroundColor: "#16A34A",
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  submitBtnText: { color: "white", fontSize: 16 },

  // iOS Picker Styles
  iosPickerModal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  iosPickerContent: {
    backgroundColor: "white",
    paddingBottom: 20,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  iosPickerDone: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 16,
  },
});

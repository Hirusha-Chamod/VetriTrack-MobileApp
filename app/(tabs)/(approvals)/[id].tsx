import { Colors, Fonts } from "@/constants/theme";
import { Supplier, supplierApi } from "@/services/supplierService";
import { useApprovalStore } from "@/store/useApprovalStore";
import { useToastStore } from "@/store/useToastStore";
import { safeGoBack } from "@/utils/navigation";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronLeft,
  FileText,
  Lightbulb,
  Minus,
  Plus,
  X,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RequestReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const {
    pendingRequests,
    updateRequestStatus,
    isLoading: isApprovalLoading,
  } = useApprovalStore();

  const request: any = pendingRequests.find((r) => r._id === id);

  // Flow State
  const [step, setStep] = useState<"review" | "suppliers">("review");
  const [quantity, setQuantity] = useState(request?.quantity || 1);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null,
  );

  // Suppliers State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true);

  // Modals
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch real suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await supplierApi.getAll();
        // Only show active suppliers to pick from
        const activeSuppliers = data.filter((s) => s.status === "Active");
        setSuppliers(activeSuppliers);

        // If there's an existing valid supplier from the DB, auto-select it initially
        if (request?.supplierId && typeof request.supplierId === "object") {
          setSelectedSupplierId(request.supplierId._id);
        }
      } catch (error) {
        showToast("Failed to load suppliers", "error");
      } finally {
        setIsLoadingSuppliers(false);
      }
    };
    if (request) fetchSuppliers();
  }, [request]);

  // Helper to extract numeric value from string like "5 days"
  const getNumericLeadTime = (notes?: string) => {
    if (!notes) return 999;
    const match = notes.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 999;
  };

  // Find lowest lead time supplier
  const lowestLeadTimeSupplier = useMemo(() => {
    if (suppliers.length === 0) return null;
    return suppliers.reduce((lowest, current) =>
      getNumericLeadTime(current.leadTimeNotes) <
      getNumericLeadTime(lowest.leadTimeNotes)
        ? current
        : lowest,
    );
  }, [suppliers]);

  // Handle Action
  const handleApprove = async () => {
    if (!selectedSupplierId) return;
    try {
      await updateRequestStatus(
        request._id,
        "approved",
        quantity,
        selectedSupplierId,
      );
      showToast("Request approved! Draft PO created.", "success");
      safeGoBack(router, "/(tabs)/(approvals)");
    } catch (error: any) {
      showToast(error.message || "Failed to approve request", "error");
    }
  };

  const handleReject = async () => {
    try {
      await updateRequestStatus(request._id, "rejected");
      setShowRejectDialog(false);
      showToast("Request rejected.", "success");
      safeGoBack(router, "/(tabs)/(approvals)");
    } catch (error: any) {
      showToast(error.message || "Failed to reject request", "error");
    }
  };

  if (!request) return null;

  // UI Helpers
  const requesterName =
    request.requestedBy && typeof request.requestedBy === "object"
      ? request.requestedBy.fullName
      : "Unknown Staff";
  const itemName =
    request.itemId && typeof request.itemId === "object"
      ? request.itemId.itemName
      : request.product;

  const getSourceBadge = (source?: string) => {
    switch (source) {
      case "recommendation":
        return {
          label: "Recommendation",
          bg: "#CFFAFE",
          text: "#0369A1",
          icon: Lightbulb,
        };
      case "low-stock":
        return {
          label: "Low Stock",
          bg: "#FFEDD5",
          text: "#C2410C",
          icon: AlertTriangle,
        };
      case "manual":
      default:
        return {
          label: "Manual",
          bg: "#F3F4F6",
          text: "#4B5563",
          icon: FileText,
        };
    }
  };

  const sourceBadge = getSourceBadge(request.source);
  const SourceIcon = sourceBadge.icon;

  // ==========================================
  // STEP 1: REVIEW QUANTITY
  // ==========================================
  if (step === "review") {
    return (
      <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#2563EB"
          translucent={false}
        />

        <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
          <SafeAreaView>
            <View style={styles.headerContent}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backBtn}
              >
                <ChevronLeft size={28} color="white" />
              </TouchableOpacity>
              <View style={styles.headerTitleGroup}>
                <View style={styles.headerIconBg}>
                  <FileText size={20} color="white" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}
                  >
                    Review Request
                  </Text>
                  <Text
                    style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                  >
                    Request #{request._id.slice(-6).toUpperCase()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: sourceBadge.bg, marginLeft: 8 },
                  ]}
                >
                  <SourceIcon
                    size={12}
                    color={sourceBadge.text}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.badgeText, { color: sourceBadge.text }]}>
                    {sourceBadge.label}
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Request Information
            </Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Requested By</Text>
              <Text style={styles.infoValue}>{requesterName}</Text>
            </View>
            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Submitted</Text>
              <Text style={styles.infoValue}>
                {format(new Date(request.createdAt), "MMM d, yyyy h:mm a")}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Item to Review
            </Text>
            <Text style={styles.helperText}>Review and adjust quantity</Text>

            <View style={styles.itemBox}>
              <Text style={styles.itemName}>{itemName}</Text>
              {request.reason ? (
                <Text style={styles.itemNotes}>"{request.reason}"</Text>
              ) : null}

              <Text style={styles.quantityLabel}>Quantity</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity((q: number) => Math.max(1, q - 1))}
                >
                  <Minus size={16} color="#374151" />
                </TouchableOpacity>
                <TextInput
                  style={styles.stepperInput}
                  value={quantity.toString()}
                  onChangeText={(val) => setQuantity(parseInt(val) || 1)}
                  keyboardType="numeric"
                />
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setQuantity((q: number) => q + 1)}
                >
                  <Plus size={16} color="#374151" />
                </TouchableOpacity>
                <Text style={styles.stepperUnit}>units</Text>
              </View>

              {quantity !== request.quantity && (
                <Text style={styles.changedWarning}>
                  Original Request: {request.quantity} units
                </Text>
              )}
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              <Text style={{ fontWeight: "bold" }}>Next Step:</Text> You'll
              assign a supplier before final approval.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBarStacked}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setStep("suppliers")}
          >
            <Text style={styles.primaryBtnText}>Next: Select Supplier</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dangerOutlineBtn}
            onPress={() => setShowRejectDialog(true)}
          >
            <XCircle size={20} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.dangerOutlineBtnText}>Reject Request</Text>
          </TouchableOpacity>
        </View>

        {/* Reject Modal */}
        <Modal visible={showRejectDialog} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { fontFamily: Fonts?.bold }]}>
                  Reject Request
                </Text>
                <TouchableOpacity onPress={() => setShowRejectDialog(false)}>
                  <X size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.modalDesc}>
                Please provide a reason for rejecting this request.
              </Text>
              <TextInput
                style={styles.textArea}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Enter rejection reason..."
                multiline
                textAlignVertical="top"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalBtnOutline}
                  onPress={() => setShowRejectDialog(false)}
                >
                  <Text style={styles.modalBtnOutlineText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnDanger}
                  onPress={handleReject}
                  disabled={!rejectionReason.trim() || isApprovalLoading}
                >
                  {isApprovalLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.modalBtnDangerText}>
                      Reject Request
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ==========================================
  // STEP 2: SELECT SUPPLIER
  // ==========================================
  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#2563EB"
        translucent={false}
      />

      <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
        <SafeAreaView>
          <View style={[styles.headerContent, { paddingBottom: 16 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Select Supplier
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  { fontFamily: Fonts?.sans, marginTop: 4 },
                ]}
              >
                {itemName} - {quantity} units
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.helperText}>
          Select a supplier to add this item to a Draft PO:
        </Text>

        {isLoadingSuppliers ? (
          <ActivityIndicator
            size="large"
            color="#2563EB"
            style={{ marginTop: 20 }}
          />
        ) : suppliers.length === 0 ? (
          <Text style={styles.helperText}>
            No active suppliers found. Please add a supplier first.
          </Text>
        ) : (
          suppliers.map((supplier) => {
            const isSelected = selectedSupplierId === supplier._id;
            const isRecommended =
              lowestLeadTimeSupplier &&
              supplier._id === lowestLeadTimeSupplier._id;

            return (
              <TouchableOpacity
                key={supplier._id}
                style={[
                  styles.supplierCard,
                  isSelected && styles.supplierCardActive,
                ]}
                onPress={() => setSelectedSupplierId(supplier._id)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <Text style={styles.supplierName}>
                      {supplier.supplierName}
                    </Text>
                    {isRecommended && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>Recommended</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.supplierAddress}>{supplier.address}</Text>
                  <Text style={styles.supplierLeadTime}>
                    Lead Time:{" "}
                    <Text style={{ fontWeight: "bold", color: "#111827" }}>
                      {supplier.leadTimeNotes || "Unknown"}
                    </Text>
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Check size={14} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}

        {lowestLeadTimeSupplier && !isLoadingSuppliers && (
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              <Text style={{ fontWeight: "bold" }}>💡 Tip:</Text> Recommended
              based on shortest delivery time.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomBarStacked}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            (!selectedSupplierId || isLoadingSuppliers) && { opacity: 0.5 },
          ]}
          onPress={handleApprove}
          disabled={
            !selectedSupplierId || isLoadingSuppliers || isApprovalLoading
          }
        >
          {isApprovalLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <CheckCircle size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>Approve & Create PO</Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryOutlineBtn}
          onPress={() => setStep("review")}
        >
          <Text style={styles.secondaryOutlineBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { paddingBottom: 10 },
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
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: { fontSize: 11, fontWeight: "600" },

  scrollContent: { padding: 16, paddingBottom: 140 },
  card: {
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
  sectionTitle: { fontSize: 16, color: "#111827", marginBottom: 12 },
  helperText: { fontSize: 13, color: "#6B7280", marginBottom: 16 },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 14, color: "#4B5563" },
  infoValue: { fontSize: 14, color: "#111827", fontWeight: "500" },

  itemBox: { backgroundColor: "#F9FAFB", padding: 16, borderRadius: 12 },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  itemNotes: {
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
    marginBottom: 12,
  },
  quantityLabel: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
    marginBottom: 8,
  },
  stepperContainer: { flexDirection: "row", alignItems: "center" },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  stepperInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "white",
    textAlign: "center",
    marginHorizontal: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  stepperUnit: { marginLeft: 8, fontSize: 14, color: "#6B7280" },
  changedWarning: { color: "#C2410C", fontSize: 12, marginTop: 8 },

  infoBanner: { backgroundColor: "#EFF6FF", padding: 16, borderRadius: 12 },
  infoBannerText: { color: "#1E3A8A", fontSize: 13 },

  // Supplier Step Styles
  supplierCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  supplierCardActive: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  supplierName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: { color: "white", fontSize: 10, fontWeight: "bold" },
  supplierAddress: { fontSize: 13, color: "#6B7280", marginBottom: 8 },
  supplierLeadTime: { fontSize: 13, color: "#4B5563" },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginTop: 4,
  },

  tipBox: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  tipText: { color: "#1E3A8A", fontSize: 13 },

  // Bottom Bars
  bottomBarStacked: {
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
    backgroundColor: "#2563EB",
    height: 50,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontSize: 16, fontWeight: "bold" },
  dangerOutlineBtn: {
    height: 50,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  dangerOutlineBtnText: { color: "#DC2626", fontSize: 16, fontWeight: "bold" },
  secondaryOutlineBtn: {
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  secondaryOutlineBtnText: {
    color: "#374151",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: { backgroundColor: "white", borderRadius: 16, padding: 20 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, color: "#111827" },
  modalDesc: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 16,
    lineHeight: 20,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    height: 100,
    fontSize: 15,
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtnOutline: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  modalBtnOutlineText: { color: "#374151", fontWeight: "600", fontSize: 15 },
  modalBtnDanger: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#DC2626",
    alignItems: "center",
  },
  modalBtnDangerText: { color: "white", fontWeight: "600", fontSize: 15 },
});

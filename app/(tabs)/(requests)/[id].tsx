import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useApprovalStore } from "@/store/useApprovalStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { format } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    CheckCircle,
    ChevronLeft,
    Clock,
    FileText,
    Package,
    X,
    XCircle
} from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Modal,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const showToast = useToastStore((state) => state.showToast);

  const { user } = useAuthStore();
  const isOwner = user?.role === "owner";

  const { myRequests, pendingRequests, updateRequestStatus, isLoading } =
    useApprovalStore();

  const request: any = isOwner
    ? pendingRequests.find((r) => r._id === id)
    : myRequests.find((r) => r._id === id);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  if (!request) return null;

  // --- ACTIONS ---
  const handleApprove = async () => {
    try {
      await updateRequestStatus(request._id, "approved");
      showToast("Request approved! Draft PO created.", "success");
      router.back();
    } catch (error: any) {
      showToast(error.message || "Failed to approve request", "error");
    }
  };

  const handleReject = async () => {
    try {
      // Note: If you want to save the reject reason, you'll need to add it to your DTO/Service later!
      await updateRequestStatus(request._id, "rejected");
      setShowRejectModal(false);
      showToast("Request rejected.", "success");
      router.back();
    } catch (error: any) {
      showToast(error.message || "Failed to reject request", "error");
    }
  };

  // --- UI TIMELINE LOGIC ---
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Submitted",
          bg: "#DBEAFE",
          text: "#1D4ED8",
          icon: Clock,
        };
      case "approved":
        return {
          label: "Approved",
          bg: "#DCFCE7",
          text: "#15803D",
          icon: CheckCircle,
        };
      case "addedToDraftPO":
        return {
          label: "Added to Draft PO",
          bg: "#F3E8FF",
          text: "#7E22CE",
          icon: Package,
        };
      case "convertedToPO":
        return {
          label: "Converted to PO",
          bg: "#E0E7FF",
          text: "#4338CA",
          icon: Package,
        };
      case "rejected":
        return {
          label: "Rejected",
          bg: "#FEE2E2",
          text: "#B91C1C",
          icon: XCircle,
        };
      default:
        return {
          label: status,
          bg: "#F3F4F6",
          text: "#4B5563",
          icon: FileText,
        };
    }
  };

  const statusInfo = getStatusInfo(request.status);
  const StatusIcon = statusInfo.icon;

  const getStatusSteps = () => {
    const allSteps = [
      { label: "Request Submitted", status: "pending" },
      { label: "Owner Approved", status: "approved" },
      { label: "Added to Draft PO", status: "addedToDraftPO" },
      { label: "Converted to PO", status: "convertedToPO" },
    ];

    const statusOrder = [
      "pending",
      "approved",
      "addedToDraftPO",
      "convertedToPO",
    ];
    let currentIndex = statusOrder.indexOf(request.status);

    // If it's already a draft PO, it technically passed "Approved"
    if (request.status === "addedToDraftPO") currentIndex = 2;

    return allSteps.map((step, idx) => ({
      ...step,
      active: idx <= currentIndex && request.status !== "rejected",
      isCurrent: idx === currentIndex && request.status !== "rejected",
    }));
  };

  const steps = getStatusSteps();

  // Safely extract populated names
  const requesterName =
    request.requestedBy && typeof request.requestedBy === "object"
      ? request.requestedBy.fullName
      : "Unknown Staff";
  const itemName =
    request.itemId && typeof request.itemId === "object"
      ? request.itemId.itemName
      : request.product;

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
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ChevronLeft size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconBg}>
                <FileText size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Request Details
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {format(new Date(request.createdAt), "MMM d, yyyy h:mm a")}
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
        {/* Status Card */}
        <View
          style={[
            styles.card,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { marginBottom: 0, fontFamily: Fonts?.bold },
            ]}
          >
            Current Status
          </Text>
          <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
            <StatusIcon
              size={14}
              color={statusInfo.text}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.badgeText, { color: statusInfo.text }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Dynamic Timeline */}
        {request.status !== "rejected" && (
          <View style={styles.card}>
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Request Timeline
            </Text>
            <View style={styles.timelineContainer}>
              {steps.map((step, idx) => (
                <View key={step.status} style={styles.timelineStep}>
                  <View style={styles.timelineIconContainer}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: step.active ? "#DCFCE7" : "#F3F4F6",
                        },
                      ]}
                    >
                      {step.active ? (
                        <CheckCircle size={16} color="#15803D" />
                      ) : (
                        <Clock size={16} color="#9CA3AF" />
                      )}
                    </View>
                    {/* Don't show line after the last item */}
                    {idx < steps.length - 1 && (
                      <View
                        style={[
                          styles.timelineLine,
                          {
                            backgroundColor:
                              step.active && !step.isCurrent
                                ? "#15803D"
                                : "#E5E7EB",
                          },
                        ]}
                      />
                    )}
                  </View>
                  <View style={styles.timelineTextContainer}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        !step.active && { color: "#9CA3AF" },
                      ]}
                    >
                      {step.label}
                    </Text>
                    {idx === 0 && (
                      <Text style={styles.timelineSub}>
                        {format(new Date(request.createdAt), "MMM d, yyyy")}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Rejection Notice */}
        {request.status === "rejected" && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: "#FEF2F2",
                borderLeftWidth: 4,
                borderLeftColor: "#EF4444",
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
              <XCircle
                size={20}
                color="#DC2626"
                style={{ marginRight: 8, marginTop: 2 }}
              />
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    color: "#991B1B",
                    fontWeight: "bold",
                    marginBottom: 4,
                  }}
                >
                  Request Rejected
                </Text>
                <Text style={{ fontSize: 14, color: "#991B1B" }}>
                  This request was declined by the owner.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Request Information */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
            Request Information
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Requested By</Text>
            <Text style={styles.infoValue}>{requesterName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Item</Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Package size={14} color="#6B7280" style={{ marginRight: 4 }} />
              <Text style={styles.infoValue}>{itemName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity</Text>
            <Text style={styles.infoValue}>{request.quantity}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Est. Total</Text>
            <Text style={styles.infoValue}>
              LKR {request.totalAmount?.toLocaleString()}
            </Text>
          </View>

          <View
            style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}
          >
            <Text style={styles.infoLabel}>Urgency</Text>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    request.urgency === "high" ? "#FEE2E2" : "#F3F4F6",
                  paddingVertical: 2,
                  paddingHorizontal: 6,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: request.urgency === "high" ? "#B91C1C" : "#4B5563" },
                ]}
              >
                {request.urgency.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Reason / Notes */}
        <View style={styles.card}>
          <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
            Reason / Notes
          </Text>
          <Text style={styles.notesText}>{request.reason}</Text>
        </View>
      </ScrollView>

      {/* --- OWNER ACTIONS --- */}
      {isOwner && request.status === "pending" && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => setShowRejectModal(true)}
            disabled={isLoading}
          >
            <XCircle size={20} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.rejectBtnText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={handleApprove}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <CheckCircle
                  size={20}
                  color="white"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.approveBtnText}>Approve & Create PO</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Reject Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { fontFamily: Fonts?.bold }]}>
                Reject Request
              </Text>
              <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                <X size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalDesc}>
              Are you sure you want to reject this request? It will be marked as
              rejected and sent back to the staff.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnOutline}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.modalBtnOutlineText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnDanger}
                onPress={handleReject}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalBtnDangerText}>Confirm Reject</Text>
                )}
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
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, color: "#111827", marginBottom: 16 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: { fontSize: 13, fontWeight: "600" },

  // Timeline
  timelineContainer: { paddingLeft: 8, paddingTop: 8 },
  timelineStep: { flexDirection: "row", marginBottom: 0 },
  timelineIconContainer: { alignItems: "center", marginRight: 12 },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    height: 36,
    marginTop: -4,
    marginBottom: -4,
    zIndex: 1,
  },
  timelineTextContainer: { flex: 1, paddingTop: 6, paddingBottom: 24 },
  timelineTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  timelineSub: { fontSize: 13, color: "#6B7280", marginTop: 2 },

  // Info Rows
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  infoLabel: { fontSize: 14, color: "#4B5563" },
  infoValue: { fontSize: 14, fontWeight: "500", color: "#111827" },
  notesText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },

  viewPoBtn: {
    backgroundColor: "#4338CA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  viewPoBtnText: { color: "white", fontSize: 15, fontWeight: "bold" },

  // Owner Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  rejectBtn: { borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" },
  rejectBtnText: { color: "#DC2626", fontSize: 15, fontWeight: "bold" },
  approveBtn: { borderColor: "#16A34A", backgroundColor: "#16A34A" },
  approveBtnText: { color: "white", fontSize: 15, fontWeight: "bold" },

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
    marginBottom: 24,
    lineHeight: 20,
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

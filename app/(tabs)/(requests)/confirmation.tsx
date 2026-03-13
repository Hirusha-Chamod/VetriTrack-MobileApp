import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle, FileText, Package } from "lucide-react-native";
import React from "react";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function RequestSubmissionConfirmationScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  // We pass these params from the create screen when navigating here!
  const { itemName, quantity, unit } = useLocalSearchParams<{
    itemName: string;
    quantity: string;
    unit: string;
  }>();

  const handleViewRequests = () => {
    // Replace so they can't go "back" to this success screen
    router.replace("/(tabs)/(requests)/" as any);
  };

  const handleBackToDashboard = () => {
    // Replace so they go straight to the root dashboard
    router.replace("/(tabs)/" as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <View style={styles.container}>
        {/* Success Icon */}
        <View style={styles.iconWrapper}>
          <CheckCircle size={48} color="#16A34A" />
        </View>

        {/* Success Message */}
        <Text style={[styles.title, { fontFamily: Fonts?.bold }]}>
          Request Submitted!
        </Text>
        <Text style={[styles.subtitle, { fontFamily: Fonts?.sans }]}>
          Your reorder request has been submitted for owner approval
        </Text>

        {/* Request Summary Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.cardIconBox}>
              <Package size={20} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { fontFamily: Fonts?.bold }]}>
                Request Summary
              </Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Item:</Text>
                <Text style={styles.summaryValue} numberOfLines={1}>
                  {itemName || "Unknown Item"}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Quantity:</Text>
                <Text style={styles.summaryValue}>
                  {quantity || "0"} {unit || ""}
                </Text>
              </View>

              <View style={[styles.summaryRow, styles.summaryRowBorder]}>
                <Text style={styles.summaryLabel}>Status:</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Pending Approval</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Info Note Card */}
        <View style={styles.infoCard}>
          <FileText
            size={20}
            color="#2563EB"
            style={{ marginTop: 2, marginRight: 12 }}
          />
          <Text style={[styles.infoText, { fontFamily: Fonts?.sans }]}>
            The owner will review your request and handle supplier selection and
            purchase order creation.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleViewRequests}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryBtnText, { fontFamily: Fonts?.bold }]}>
              View My Requests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleBackToDashboard}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.secondaryBtnText, { fontFamily: Fonts?.bold }]}
            >
              Back to Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  iconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: "#DCFCE7",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    marginBottom: 24,
  },
  cardContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  cardIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#DBEAFE",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  summaryRowBorder: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 0,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#4B5563",
  },
  summaryValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
    marginLeft: 16,
  },

  statusBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },

  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E3A8A",
    lineHeight: 20,
  },

  actionContainer: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "white",
    fontSize: 15,
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: "#374151",
    fontSize: 15,
  },
});

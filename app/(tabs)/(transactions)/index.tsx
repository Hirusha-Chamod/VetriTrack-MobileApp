import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { useTransactionStore } from "@/store/useTransactionStore";
import { safeGoBack } from "@/utils/navigation";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import {
  ArrowUpDown,
  ChevronRight,
  Download,
  Edit3,
  FileSpreadsheet,
  History,
  Upload,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function TransactionsHubScreen() {
  const router = useRouter();
  const colorScheme = "light";
  const theme = Colors[colorScheme];
  const { user, logout } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);
  const { importTransactions, isLoading } = useTransactionStore();

  const [isPicking, setIsPicking] = useState(false);

  const handleImport = async () => {
    try {
      setIsPicking(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
          "text/comma-separated-values",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsPicking(false);
        return;
      }

      const file = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/octet-stream",
      } as any);

      const response = await importTransactions(formData);
      showToast(response.message, "success");
    } catch (error: any) {
      showToast(error.message || "Failed to import transactions", "error");
    } finally {
      setIsPicking(false);
    }
  };

  const actions = [
    {
      title: "Receive Stock",
      description: "Record incoming inventory from POs",
      icon: Download,
      bg: "#F0FDF4",
      iconColor: "#16A34A",
      destination: "receive",
    },
    {
      title: "Issue Stock (FEFO)",
      description: "Issue stock using First Expiry, First Out",
      icon: Upload,
      bg: "#EFF6FF",
      iconColor: "#2563EB",
      destination: "issue",
    },
    {
      title: "Stock Adjustment",
      description: "Adjust inventory for corrections",
      icon: Edit3,
      bg: "#FFF7ED",
      iconColor: "#EA580C",
      destination: "adjust",
    },
    {
      title: "Bulk Import",
      description: "Import transactions via CSV or Excel",
      icon: FileSpreadsheet,
      bg: "#F3E8FF",
      iconColor: "#7E22CE",
      onPress: handleImport,
    },
    {
      title: "Transaction History",
      description: "View the audit log of all stock movements",
      icon: History,
      bg: "#F1F5F9",
      iconColor: "#475569",
      destination: "history",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#9333EA"
        translucent={false}
      />

      <Header
        title="Transactions"
        onBack={() => safeGoBack(router, "/(tabs)/")}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/")}
        onProfile={() => router.push("/profile" as any)}
      />

      <View style={[styles.headerWrapper, { backgroundColor: "#9333EA" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <ArrowUpDown size={32} color="white" />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Transactions Hub
              </Text>
              <Text
                style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
              >
                Manage inventory movements
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentPad}>
        <Text style={[styles.helperText, { fontFamily: Fonts?.sans }]}>
          Select a transaction type to record inventory movements
        </Text>

        {actions.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() => {
              if (action.onPress) {
                action.onPress();
              } else if (action.destination) {
                router.push(
                  `/(tabs)/(transactions)/${action.destination}` as any,
                );
              }
            }}
            disabled={action.onPress ? isPicking || isLoading : false}
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: action.bg }]}>
              <action.icon size={28} color={action.iconColor} strokeWidth={2} />
            </View>

            <View style={styles.textGroup}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.textPrimary, fontFamily: Fonts?.bold },
                ]}
              >
                {action.title}
              </Text>
              <Text
                style={[
                  styles.cardDesc,
                  { color: theme.textSecondary, fontFamily: Fonts?.sans },
                ]}
              >
                {action.description}
              </Text>
            </View>

            {action.onPress && (isPicking || isLoading) ? (
              <ActivityIndicator color={action.iconColor} />
            ) : (
              <ChevronRight size={20} color="#9CA3AF" />
            )}
          </TouchableOpacity>
        ))}
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerTitle: { fontSize: 22, color: "white", marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },

  contentPad: { padding: 16, paddingTop: 20 },
  helperText: { fontSize: 14, color: "#6B7280", marginBottom: 16 },

  card: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textGroup: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});

import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { ArrowUpDown, Download, Edit3, Upload } from "lucide-react-native";
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

type Destination = "receive" | "issue" | "adjust";

export default function TransactionsHubScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleNavigate = (destination: Destination) => {
    // Navigates to the respective screens inside the (transactions) folder
    router.push(`/(tabs)/(transactions)/${destination}` as any);
  };

  const actions = [
    {
      title: "Receive Stock",
      description: "Record incoming inventory from POs",
      icon: Download,
      bg: "#F0FDF4", // bg-green-50
      iconColor: "#16A34A", // text-green-600
      destination: "receive" as Destination,
    },
    {
      title: "Issue Stock (FEFO)",
      description: "Issue stock using First Expiry, First Out",
      icon: Upload,
      bg: "#EFF6FF", // bg-blue-50
      iconColor: "#2563EB", // text-blue-600
      destination: "issue" as Destination,
    },
    {
      title: "Stock Adjustment",
      description: "Adjust inventory for corrections",
      icon: Edit3,
      bg: "#FFF7ED", // bg-orange-50
      iconColor: "#EA580C", // text-orange-600
      destination: "adjust" as Destination,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#9333EA"
        translucent={false}
      />
      <Header
        title="Transactions"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/" as any)}
        onProfile={() => router.push("/profile" as any)}
      />

      {/* Header - Purple 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#9333EA" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <ArrowUpDown size={32} color="white" />
            <View>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.instructionText,
            { color: theme.textSecondary, fontFamily: Fonts?.sans },
          ]}
        >
          Select a transaction type to record inventory movements
        </Text>

        <View style={styles.cardsContainer}>
          {actions.map((action, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() => handleNavigate(action.destination)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconBox, { backgroundColor: action.bg }]}>
                <action.icon
                  size={28}
                  color={action.iconColor}
                  strokeWidth={2}
                />
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
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 4,
  },
  cardsContainer: {
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
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
  },
  cardTitle: {
    fontSize: 17,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
});

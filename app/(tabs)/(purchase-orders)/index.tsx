import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import { ChevronRight, FileText, Package } from "lucide-react-native";
import React from "react";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function OrdersHubScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const hubCards = [
    {
      title: "Draft Orders",
      description: "Build supplier-specific draft POs",
      icon: FileText,
      bg: "#F3E8FF", // purple-50 equivalent
      iconColor: "#9333EA", // purple-600
      destination: "drafts", // We will build this next!
    },
    {
      title: "Track Purchase Orders",
      description: "View status, partial receiving, and completion",
      icon: Package,
      bg: "#EFF6FF", // blue-50
      iconColor: "#2563EB", // blue-600
      destination: "list", // Points to the file you just renamed!
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#9333EA"
        translucent={false}
      />

      {/* Header - Purple 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#9333EA" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <FileText size={32} color="white" />
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                Orders
              </Text>
              <Text
                style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
              >
                Manage drafts and track orders
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentPad}>
        {hubCards.map((card, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.card}
            onPress={() =>
              router.push(
                `/(tabs)/(purchase-orders)/${card.destination}` as any,
              )
            }
            activeOpacity={0.7}
          >
            <View style={[styles.iconBox, { backgroundColor: card.bg }]}>
              <card.icon size={24} color={card.iconColor} strokeWidth={2} />
            </View>

            <View style={styles.textGroup}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: theme.textPrimary, fontFamily: Fonts?.bold },
                ]}
              >
                {card.title}
              </Text>
              <Text
                style={[
                  styles.cardDesc,
                  { color: theme.textSecondary, fontFamily: Fonts?.sans },
                ]}
                numberOfLines={1}
              >
                {card.description}
              </Text>
            </View>

            <ChevronRight size={20} color="#9CA3AF" />
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

  contentPad: { padding: 16, paddingTop: 20, gap: 12 },

  card: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  textGroup: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
  },
});

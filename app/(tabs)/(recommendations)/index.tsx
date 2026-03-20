import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useInventoryStore } from "@/store/useInventoryStore";
import { useRouter } from "expo-router";
import {
    ArrowLeft,
    ChevronRight,
    Lightbulb
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function SmartRecommendationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { recommendations, isLoading, fetchRecommendations } =
    useInventoryStore();

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const getBadgeStyle = (urgency: "HIGH" | "MEDIUM" | "LOW") => {
    switch (urgency) {
      case "HIGH":
        return { bg: "#FEE2E2", text: "#B91C1C", label: "High Urgency" };
      case "MEDIUM":
        return { bg: "#FFEDD5", text: "#C2410C", label: "Medium Urgency" };
      case "LOW":
        return { bg: "#DCFCE7", text: "#15803D", label: "Low Urgency" };
      default:
        return { bg: "#F3F4F6", text: "#374151", label: urgency };
    }
  };
  
  // Helper to generate the descriptive subtitle based on AI data
  const getRecommendationMessage = (item: any) => {
    let msg = "";
    if (item.urgency === "HIGH") {
      msg = "Critical stock level. Expected to stock out before next delivery.";
    } else if (item.urgency === "MEDIUM") {
      msg = "Stock is dropping below safety levels. Reorder recommended.";
    } else {
      msg = "Stock levels are currently stable.";
    }

    if (item.isExpiringSoon) {
      const dateStr = new Date(item.nearestExpiryDate).toLocaleDateString(
        "en-GB",
        { month: "short", day: "numeric", year: "numeric" },
      );
      msg += `\n⚠️ Nearest batch expires on ${dateStr}.`;
    }
    return msg;
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      {/* Top Banner Area */}
      <View style={[styles.headerWrapper, { backgroundColor: "#2563EB" }]}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
              Smart Recommendations
            </Text>
            <View style={{ width: 24 }} /> {/* Empty view for flex alignment */}
          </View>

          {/* Blue Highlight Box (Matching Figma) */}
          <View style={styles.heroBox}>
            <Lightbulb size={28} color="white" style={{ marginRight: 16 }} />
            <View>
              <Text style={[styles.heroTitle, { fontFamily: Fonts?.bold }]}>
                Smart Recommendations
              </Text>
              <Text style={[styles.heroSubtitle, { fontFamily: Fonts?.sans }]}>
                AI-powered reorder suggestions
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={fetchRecommendations}
            colors={["#2563EB"]}
          />
        }
      >
        <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
          ALL RECOMMENDATIONS ({recommendations?.length || 0})
        </Text>

        {isLoading && !recommendations?.length ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Running AI Forecast...</Text>
          </View>
        ) : recommendations?.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>
              No recommendations available right now.
            </Text>
          </View>
        ) : (
          recommendations?.map((item, index) => {
            const badge = getBadgeStyle(item.urgency);
            const isCriticalExpiry =
              item.isExpiringSoon && item.urgency === "LOW";

            return (
              <TouchableOpacity
                key={item.itemCode || index}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => router.push(`/(tabs)/(recommendations)/${item.itemCode}` as any)}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.itemName, { fontFamily: Fonts?.bold }]}>
                    {item.itemName}
                  </Text>
                  <ChevronRight size={20} color="#9CA3AF" />
                </View>

                <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                  <Text
                    style={[
                      styles.badgeText,
                      { color: badge.text, fontFamily: Fonts?.bold },
                    ]}
                  >
                    {badge.label}
                  </Text>
                </View>

                <View style={styles.stockRow}>
                  <Text style={styles.stockLabel}>
                    Current Stock:{" "}
                    <Text
                      style={[styles.stockValue, { fontFamily: Fonts?.bold }]}
                    >
                      {item.totalCurrentStock}
                    </Text>
                  </Text>
                  <Text style={styles.stockLabel}>
                    Suggested:{" "}
                    <Text
                      style={[
                        styles.stockValue,
                        { color: "#2563EB", fontFamily: Fonts?.bold },
                      ]}
                    >
                      {item.recommendedOrderQty}
                    </Text>
                  </Text>
                </View>

                <Text
                  style={[
                    styles.description,
                    item.isExpiringSoon && {
                      color: "#B91C1C",
                      fontWeight: "600",
                    },
                  ]}
                >
                  {getRecommendationMessage(item)}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerWrapper: { paddingBottom: 16 },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 20,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, color: "white" },

  // Hero Banner inside Header
  heroBox: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 20,
    borderRadius: 12,
  },
  heroTitle: { fontSize: 18, color: "white", marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.9)" },

  // Scroll Content
  scrollContent: { padding: 16, paddingBottom: 40 },
  sectionTitle: {
    fontSize: 13,
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },

  // Cards
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemName: { fontSize: 16, color: "#111827" },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgeText: { fontSize: 12 },

  stockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  stockLabel: { fontSize: 14, color: "#4B5563" },
  stockValue: { fontSize: 15, color: "#111827" },

  description: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },

  // Utils
  centerBox: {
    marginTop: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: { marginTop: 12, color: "#4B5563", fontSize: 15 },
  emptyText: { color: "#6B7280", fontSize: 15 },
});

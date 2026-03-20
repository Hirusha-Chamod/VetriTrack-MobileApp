import { Fonts } from "@/constants/theme";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useToastStore } from "@/store/useToastStore";
import { useRouter } from "expo-router";
import {
    AlertTriangle,
    Calendar,
    Check,
    ChevronLeft,
    Lightbulb,
    Save,
    Settings as SettingsIcon,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ReorderSettingsScreen() {
  const router = useRouter();
  const showToast = useToastStore((state) => state.showToast);
  const { settings, isLoading, isSaving, fetchSettings, updateSettings } =
    useSettingsStore();

  // Local state for the UI selections
  const [horizon, setHorizon] = useState<number>(30);
  const [alertDays, setAlertDays] = useState<number>(7);

  // Load settings into local state when they arrive
  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      setHorizon(settings.recommendationHorizonDays);
      setAlertDays(settings.expiryAlertDays);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({
        recommendationHorizonDays: horizon,
        expiryAlertDays: alertDays,
      });
      showToast("Settings saved successfully!", "success");
      router.back();
    } catch (error: any) {
      showToast(error.message || "Failed to save settings", "error");
    }
  };

  const horizonOptions = [
    { label: "30 days (1 month)", value: 30 },
    { label: "90 days (3 months)", value: 90 },
    { label: "180 days (6 months)", value: 180 },
  ];

  const expiryOptions = [
    { label: "7 days", value: 7 },
    { label: "14 days", value: 14 },
    { label: "30 days", value: 30 },
  ];

  // Helper to get text label for summary
  const getHorizonLabel = (val: number) =>
    horizonOptions.find((o) => o.value === val)?.label || `${val} days`;
  const getExpiryLabel = (val: number) =>
    expiryOptions.find((o) => o.value === val)?.label || `${val} days`;

  if (isLoading && !settings) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4B5563" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Navigation */}
      <SafeAreaView style={{ backgroundColor: "#FFFFFF" }}>
        <View style={styles.navHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft size={28} color="#2563EB" />
          </TouchableOpacity>
          <Text style={[styles.navTitle, { fontFamily: Fonts?.bold }]}>
            Reorder Settings
          </Text>
          <View style={{ width: 28 }} />
        </View>
      </SafeAreaView>

      {/* Dark Slate Hero Box */}
      <View style={styles.heroBox}>
        <SettingsIcon size={32} color="white" style={{ marginRight: 16 }} />
        <View>
          <Text style={[styles.heroTitle, { fontFamily: Fonts?.bold }]}>
            Reorder Settings
          </Text>
          <Text style={[styles.heroSubtitle, { fontFamily: Fonts?.sans }]}>
            Configure forecast and alert periods
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── RECOMMENDATION HORIZON SECTION ─── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Lightbulb size={20} color="#D97706" />
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Recommendation Horizon
            </Text>
          </View>
          <Text style={[styles.sectionDesc, { fontFamily: Fonts?.sans }]}>
            Used for Smart Recommendations
          </Text>

          <Text style={[styles.inputLabel, { fontFamily: Fonts?.bold }]}>
            Forecast / Review Period
          </Text>

          {horizonOptions.map((option) => {
            const isActive = horizon === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionBtn,
                  isActive && styles.optionBtnActiveBlue,
                ]}
                onPress={() => setHorizon(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isActive && styles.optionTextActiveBlue,
                    { fontFamily: Fonts?.sans },
                  ]}
                >
                  {option.label}
                </Text>
                {isActive && <Check size={20} color="#2563EB" />}
              </TouchableOpacity>
            );
          })}

          <View style={[styles.infoBox, styles.infoBoxBlue]}>
            <Text
              style={[
                styles.infoBoxTitle,
                styles.infoBoxTextBlue,
                { fontFamily: Fonts?.bold },
              ]}
            >
              How this works:
            </Text>
            <Text
              style={[
                styles.infoBoxText,
                styles.infoBoxTextBlue,
                { fontFamily: Fonts?.sans },
              ]}
            >
              Controls the time window used to calculate reorder recommendations
              based on historical usage patterns and demand forecasting.
            </Text>
          </View>
        </View>

        {/* ─── EXPIRY ALERT WINDOW SECTION ─── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <AlertTriangle size={20} color="#DC2626" />
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Expiry Alert Window
            </Text>
          </View>
          <Text style={[styles.sectionDesc, { fontFamily: Fonts?.sans }]}>
            Expiring Soon threshold
          </Text>

          <Text style={[styles.inputLabel, { fontFamily: Fonts?.bold }]}>
            Alert Period
          </Text>

          {expiryOptions.map((option) => {
            const isActive = alertDays === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionBtn,
                  isActive && styles.optionBtnActiveRed,
                ]}
                onPress={() => setAlertDays(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    isActive && styles.optionTextActiveRed,
                    { fontFamily: Fonts?.sans },
                  ]}
                >
                  {option.label}
                </Text>
                {isActive && <Check size={20} color="#DC2626" />}
              </TouchableOpacity>
            );
          })}

          <View style={[styles.infoBox, styles.infoBoxRed]}>
            <Text
              style={[
                styles.infoBoxTitle,
                styles.infoBoxTextRed,
                { fontFamily: Fonts?.bold },
              ]}
            >
              How this works:
            </Text>
            <Text
              style={[
                styles.infoBoxText,
                styles.infoBoxTextRed,
                { fontFamily: Fonts?.sans },
              ]}
            >
              Batches expiring within this window will appear under "Expiring
              Soon" in the Expiry Management screen.
            </Text>
          </View>
        </View>

        {/* ─── SUMMARY SECTION ─── */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Calendar size={20} color="#4B5563" />
            <Text style={[styles.sectionTitle, { fontFamily: Fonts?.bold }]}>
              Current Settings Summary
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontFamily: Fonts?.sans }]}>
              Recommendation Horizon:
            </Text>
            <Text style={[styles.summaryValue, { fontFamily: Fonts?.bold }]}>
              {getHorizonLabel(horizon)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { fontFamily: Fonts?.sans }]}>
              Expiry Alert Window:
            </Text>
            <Text style={[styles.summaryValue, { fontFamily: Fonts?.bold }]}>
              {getExpiryLabel(alertDays)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.saveBtnText, { fontFamily: Fonts?.bold }]}>
                Save Settings
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: { padding: 4, marginLeft: -8 },
  navTitle: { fontSize: 18, color: "#111827" },

  heroBox: {
    backgroundColor: "#475569", // Slate 600
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
  },
  heroTitle: { fontSize: 20, color: "white", marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: "#F1F5F9" },

  scrollContent: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, color: "#111827", marginLeft: 10 },
  sectionDesc: { fontSize: 14, color: "#6B7280", marginBottom: 20 },

  inputLabel: { fontSize: 14, color: "#111827", marginBottom: 12 },

  optionBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 12,
  },
  optionText: { fontSize: 15, color: "#374151" },

  // Blue Active State (Horizon)
  optionBtnActiveBlue: { borderColor: "#2563EB", backgroundColor: "#EFF6FF" },
  optionTextActiveBlue: { color: "#2563EB" },

  // Red Active State (Expiry)
  optionBtnActiveRed: { borderColor: "#DC2626", backgroundColor: "#FEF2F2" },
  optionTextActiveRed: { color: "#DC2626" },

  infoBox: { padding: 16, borderRadius: 8, marginTop: 8, borderWidth: 1 },
  infoBoxTitle: { fontSize: 13, marginBottom: 4 },
  infoBoxText: { fontSize: 13, lineHeight: 20 },

  infoBoxBlue: { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
  infoBoxTextBlue: { color: "#1E3A8A" },

  infoBoxRed: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  infoBoxTextRed: { color: "#991B1B" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
  },
  summaryLabel: { fontSize: 14, color: "#6B7280" },
  summaryValue: { fontSize: 14, color: "#111827" },
  divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },

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
  saveBtn: {
    backgroundColor: "#16A34A",
    height: 52,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: { color: "white", fontSize: 16 },
});

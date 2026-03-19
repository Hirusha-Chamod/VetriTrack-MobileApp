import { Header } from "@/components/layout/Header";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuthStore } from "@/store/useAuthStore";
import { useSupplierStore } from "@/store/useSupplierStore";
import { useToastStore } from "@/store/useToastStore";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  Building2,
  Check,
  Clock,
  Download,
  Mail,
  MoreVertical,
  Plus,
  Search,
  Upload,
  X,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function SuppliersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const {
    suppliers,
    fetchSuppliers,
    uploadSuppliers,
    exportSuppliers,
    isLoading,
    error,
  } = useSupplierStore();

  const { user, logout } = useAuthStore();
  const showToast = useToastStore((state) => state.showToast);

  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const displaySuppliers = useMemo(() => {
    const filtered = suppliers.filter(
      (sup) =>
        sup.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sup.contactName.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return filtered.sort((a, b) =>
      a.supplierName.localeCompare(b.supplierName),
    );
  }, [suppliers, searchQuery]);

  // ─── IMPORT LOGIC ─────────────────────────────────────────────────────────
  const handleImport = () => {
    setIsMenuOpen(false); // Close the menu

    // Wait 300ms for the menu to fully disappear before opening the iOS picker
    setTimeout(async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: [
            "text/csv",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
          ],
          copyToCacheDirectory: true,
        });

        if (result.canceled) return;

        setIsProcessingFile(true);
        const file = result.assets[0];

        const fileToUpload = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        };

        await uploadSuppliers(fileToUpload);
        showToast("Suppliers imported successfully!", "success");
      } catch (err: any) {
        showToast(err.message || "Failed to import suppliers", "error");
      } finally {
        setIsProcessingFile(false);
      }
    }, 300);
  };

  // ─── EXPORT LOGIC ─────────────────────────────────────────────────────────
  const handleExport = () => {
    setIsMenuOpen(false); // Close the menu

    // Wait 300ms for export as well, since Sharing opens a system modal!
    setTimeout(async () => {
      setIsProcessingFile(true);
      try {
        const base64Data = await exportSuppliers();
        const filename = `VetriTrack_Suppliers_${new Date().toISOString().split("T")[0]}.xlsx`;
        const fileUri = FileSystem.documentDirectory + filename;

        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            dialogTitle: "Save Suppliers Export",
          });
        } else {
          showToast("Sharing is not available on this device", "error");
        }
      } catch (err: any) {
        showToast(err.message || "Failed to export suppliers", "error");
      } finally {
        setIsProcessingFile(false);
      }
    }, 300);
  };

  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0891B2"
        translucent={false}
      />
      <Header
        title="Suppliers"
        onBack={() => router.back()}
        userRole={user?.role}
        onLogout={logout}
        onDashboard={() => router.push("/(tabs)/")}
        onProfile={() => router.push("/profile" as any)}
      />

      {/* Processing Overlay */}
      {isProcessingFile && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#0891B2" />
          <Text style={styles.processingText}>Processing file...</Text>
        </View>
      )}

      {/* Header - Cyan 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#0891B2" }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleGroup}>
              <Building2 size={28} color="white" />
              <View>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  Suppliers
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {suppliers.length} registered suppliers
                </Text>
              </View>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() =>
                  router.push("/(tabs)/(suppliers)/add-supplier" as any)
                }
              >
                <Plus size={16} color="#0891B2" />
                <Text
                  style={[
                    styles.addButtonText,
                    { fontFamily: Fonts?.bold, color: "#0891B2" },
                  ]}
                >
                  Add
                </Text>
              </TouchableOpacity>

              {/* Three Dot Menu Button */}
              {user?.role === "owner" && (
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setIsMenuOpen(true)}
                >
                  <MoreVertical size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Options Dropdown Modal */}
      <Modal visible={isMenuOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsMenuOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownMenu}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleImport}
                >
                  <Upload size={18} color="#4B5563" />
                  <Text
                    style={[styles.menuItemText, { fontFamily: Fonts?.sans }]}
                  >
                    Import CSV / Excel
                  </Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleExport}
                >
                  <Download size={18} color="#4B5563" />
                  <Text
                    style={[styles.menuItemText, { fontFamily: Fonts?.sans }]}
                  >
                    Export to Excel
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.contentPad}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme.textPrimary, fontFamily: Fonts?.sans },
            ]}
            placeholder="Search suppliers..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* List Content */}
        {isLoading && suppliers.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0891B2" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={{ color: theme.danger, marginBottom: 12 }}>
              {error}
            </Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchSuppliers()}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={displaySuppliers}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading && !isProcessingFile}
                onRefresh={fetchSuppliers}
                tintColor="#0891B2"
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Building2
                  size={48}
                  color="#D1D5DB"
                  style={{ marginBottom: 12 }}
                />
                <Text style={[styles.emptyText, { fontFamily: Fonts?.sans }]}>
                  No suppliers found
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() =>
                  router.push(`/(tabs)/(suppliers)/${item._id}` as any)
                }
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.titleGroup}>
                    <Text
                      style={[styles.supplierName, { fontFamily: Fonts?.bold }]}
                    >
                      {item.supplierName}
                    </Text>
                    <Text
                      style={[styles.contactName, { fontFamily: Fonts?.sans }]}
                    >
                      {item.contactName}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "Active"
                        ? styles.statusActiveBg
                        : styles.statusInactiveBg,
                    ]}
                  >
                    {item.status === "Active" ? (
                      <Check
                        size={12}
                        color="#15803D"
                        style={{ marginRight: 4 }}
                      />
                    ) : (
                      <X size={12} color="#374151" style={{ marginRight: 4 }} />
                    )}
                    <Text
                      style={[
                        styles.statusText,
                        item.status === "Active"
                          ? styles.statusActiveText
                          : styles.statusInactiveText,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.emailRow}>
                  <Mail size={14} color="#4B5563" />
                  <Text
                    style={[styles.emailText, { fontFamily: Fonts?.sans }]}
                    numberOfLines={1}
                  >
                    {item.email}
                  </Text>
                </View>

                <View style={styles.badgeRow}>
                  <View style={styles.leadTimeBadge}>
                    <Clock
                      size={12}
                      color="#1D4ED8"
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[styles.leadTimeText, { fontFamily: Fonts?.sans }]}
                    >
                      Avg lead time: {item.averageLeadTimeDays || "N/A"} days
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { paddingBottom: 16 },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  headerTitleGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerTitle: { fontSize: 20, color: "white" },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  addButton: {
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: { fontSize: 14, marginLeft: 4 },
  menuButton: {
    padding: 4,
  },

  // Modal / Dropdown Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  dropdownMenu: {
    position: "absolute",
    top: 110, // Adjust based on your header height
    right: 20,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuItemText: { fontSize: 15, color: "#374151" },
  menuDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },

  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#0891B2",
    fontWeight: "600",
  },

  contentPad: { flex: 1, padding: 16 },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },

  listContent: { paddingBottom: 80, gap: 12 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  titleGroup: { flex: 1, paddingRight: 12 },
  supplierName: { fontSize: 16, color: "#111827", marginBottom: 4 },
  contactName: { fontSize: 14, color: "#4B5563" },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusActiveBg: { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
  statusActiveText: { color: "#15803D", fontSize: 11, fontWeight: "600" },
  statusInactiveBg: { backgroundColor: "#F9FAFB", borderColor: "#E5E7EB" },
  statusInactiveText: { color: "#374151", fontSize: 11, fontWeight: "600" },

  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  emailText: { fontSize: 14, color: "#4B5563", flex: 1 },

  badgeRow: { flexDirection: "row" },
  leadTimeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leadTimeText: { fontSize: 12, color: "#1D4ED8" },
  statusText: { fontSize: 11, fontWeight: "600" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  retryBtn: {
    backgroundColor: "#0891B2",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  emptyContainer: { alignItems: "center", paddingTop: 60 },
  emptyText: { color: "#6B7280", fontSize: 15 },
});

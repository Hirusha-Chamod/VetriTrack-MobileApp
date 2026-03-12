import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "expo-router";
import {
    ChevronLeft,
    Shield,
    User as UserIcon,
    UserPlus,
    Users,
} from "lucide-react-native";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function UserManagementScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const { users, fetchUsers, isLoading } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const renderUserCard = ({ item }: any) => {
    const isOwner = item.role === "owner";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/(tabs)/(users)/${item._id}` as any)}
      >
        <View style={styles.cardContent}>
          {/* Avatar Icon */}
          <View
            style={[
              styles.avatarBox,
              { backgroundColor: isOwner ? "#F3E8FF" : "#DBEAFE" },
            ]}
          >
            {isOwner ? (
              <Shield size={24} color="#9333EA" />
            ) : (
              <UserIcon size={24} color="#2563EB" />
            )}
          </View>

          {/* User Details (Keep your existing code here!) */}
          <View style={styles.userDetails}>
            <Text style={[styles.userName, { fontFamily: Fonts?.bold }]}>
              {item.fullName}
            </Text>

            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isOwner ? "#F3E8FF" : "#DBEAFE" },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: isOwner ? "#7E22CE" : "#1D4ED8" },
                  ]}
                >
                  {isOwner ? "Owner" : "Staff"}
                </Text>
              </View>
              {item.status === "inactive" && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: "#FEE2E2", marginLeft: 8 },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: "#B91C1C" }]}>
                    Inactive
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.emailText}>{item.email}</Text>
            <Text style={styles.usernameText}>@{item.username}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={[styles.container, { backgroundColor: "#F9FAFB" }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#0D9488"
        translucent={false}
      />

      {/* Header - Teal 600 */}
      <View style={[styles.headerWrapper, { backgroundColor: "#0D9488" }]}>
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
                <Users size={20} color="white" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>
                  User Management
                </Text>
                <Text
                  style={[styles.headerSubtitle, { fontFamily: Fonts?.sans }]}
                >
                  {users.filter((u) => u.status !== "inactive").length} active
                  users
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <View style={styles.contentPad}>
        {/* Add User Button */}
        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.8}
          // We will build this screen next!
          onPress={() => router.push("/(tabs)/(users)/add-user")}
        >
          <UserPlus size={20} color="white" style={{ marginRight: 8 }} />
          <Text style={[styles.addButtonText, { fontFamily: Fonts?.bold }]}>
            Add New User
          </Text>
        </TouchableOpacity>

        {/* User List */}
        {isLoading && users.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={fetchUsers}
                tintColor="#0D9488"
              />
            }
            renderItem={renderUserCard}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },

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

  contentPad: { flex: 1, padding: 16 },

  addButton: {
    backgroundColor: "#0D9488", // Teal 600
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  addButtonText: { color: "white", fontSize: 16 },

  listContent: { paddingBottom: 40 },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emailText: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 2,
  },
  usernameText: {
    fontSize: 12,
    color: "#6B7280",
  },
});

import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    ArrowLeft,
    LayoutDashboard,
    LogOut,
    Menu,
    MoreVertical,
    UserCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

export type UserRole = "owner" | "staff" | string; // Adjust based on your types

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onMenu?: () => void;
  onLogout?: () => void;
  showLogout?: boolean;
  userRole?: UserRole;
  onDashboard?: () => void;
  onProfile?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  onMenu,
  onLogout,
  showLogout = false,
  userRole,
  onDashboard,
  onProfile,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [menuVisible, setMenuVisible] = useState(false);

  const handleAction = (action?: () => void) => {
    setMenuVisible(false);
    if (action) action();
  };

  const showOverflowMenu = !!(userRole && onDashboard && onProfile && onLogout);

  return (
    <View
      style={[
        styles.headerContainer,
        { backgroundColor: theme.card, borderBottomColor: theme.border },
      ]}
    >
      <SafeAreaView>
        <View style={styles.headerInner}>
          {/* Left Section (Icons & Title) */}
          <View style={styles.leftSection}>
            {onBack && (
              <TouchableOpacity
                onPress={onBack}
                style={styles.iconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <ArrowLeft size={24} color={theme.primary} />
              </TouchableOpacity>
            )}

            {onMenu && !onBack && (
              <TouchableOpacity
                onPress={onMenu}
                style={styles.iconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Menu size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            )}

            <Text
              style={[
                styles.title,
                { color: theme.textPrimary, fontFamily: Fonts?.bold },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>

          {/* Right Section (Overflow Menu) */}
          <View style={styles.rightSection}>
            {showOverflowMenu && (
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={styles.iconBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MoreVertical size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Dropdown Menu Modal */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdownMenu,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleAction(onDashboard)}
                >
                  <LayoutDashboard size={18} color={theme.textPrimary} />
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: theme.textPrimary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    Dashboard
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleAction(onProfile)}
                >
                  <UserCircle size={18} color={theme.textPrimary} />
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: theme.textPrimary, fontFamily: Fonts?.sans },
                    ]}
                  >
                    Profile
                  </Text>
                </TouchableOpacity>

                <View
                  style={[styles.divider, { backgroundColor: theme.border }]}
                />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleAction(onLogout)}
                >
                  <LogOut size={18} color={theme.danger} />
                  <Text
                    style={[
                      styles.menuItemText,
                      { color: theme.danger, fontFamily: Fonts?.bold },
                    ]}
                  >
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    borderBottomWidth: 1,
    zIndex: 10,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 60,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconBtn: {
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    flex: 1, // Ensures text truncates instead of pushing the right menu off screen
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },

  // Modal / Dropdown Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  dropdownMenu: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 70, // Adjust based on SafeArea
    right: 16,
    width: 200,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemText: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    width: "100%",
  },
});

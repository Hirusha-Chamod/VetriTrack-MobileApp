import { useAuthStore } from '@/store/useAuthStore';
import {
    Activity,
    AlertTriangle,
    ArrowLeft,
    ChevronRight,
    Home,
    LogOut,
    Menu,
    Package,
    PackageOpen,
    TrendingUp,
    X
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

const SIDEBAR_WIDTH = width * 0.72;

// Sidebar — uses Animated.Value for true left-to-right slide
const Sidebar = ({ visible, onClose, username, onLogout }: any) => {
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -SIDEBAR_WIDTH, duration: 220, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal animationType="none" transparent visible={visible} onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.sidebarContent, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }} />}
            <View style={styles.sidebarHeader}>
              <View style={styles.brandGroup}>
                <Activity size={24} color="#2563EB" />
                <Text style={styles.sidebarBrandTitle}>VetriTrack</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.userInfoBox}>
              <Text style={styles.userLabel}>Logged in as</Text>
              <Text style={styles.userName}>{username}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>Staff</Text>
              </View>
            </View>

            <View style={styles.sidebarActions}>
              <TouchableOpacity style={styles.sidebarLogoutBtn} onPress={() => { onClose(); onLogout(); }}>
                <LogOut size={18} color="#DC2626" />
                <Text style={styles.sidebarLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>

        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.modalBackground, { opacity: fadeAnim }]} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const HomeScreen = ({ onNavigate }: any) => (
  <View style={styles.homeContent}>
    {/* Quick Stats — full border, not just left border */}
    <View style={styles.statsGrid}>
      <View style={[styles.statCard, styles.statCardBlue]}>
        <View style={styles.statHeader}>
          <Package size={18} color="#2563EB" />
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <Text style={[styles.statValue, { color: '#2563EB' }]}>147</Text>
      </View>
      <View style={[styles.statCard, styles.statCardRed]}>
        <View style={styles.statHeader}>
          <AlertTriangle size={18} color="#DC2626" />
          <Text style={styles.statLabel}>Alerts</Text>
        </View>
        <Text style={[styles.statValue, { color: '#DC2626' }]}>11</Text>
      </View>
    </View>

    {/* Main Menu Cards — full border-2 like Figma */}
    <MenuCard
      title="Transactions Hub"
      subtitle="Receive, Issue & Adjust Stock"
      icon={<PackageOpen size={24} color="#2563EB" />}
      bg="#DBEAFE"
      borderColor="#93C5FD"
      onPress={() => onNavigate('transactions')}
    />
    <MenuCard
      title="Smart Recommendations"
      subtitle="AI-powered procurement"
      icon={<TrendingUp size={24} color="#16A34A" />}
      bg="#DCFCE7"
      borderColor="#86EFAC"
      onPress={() => onNavigate('recommendations')}
    />
    <MenuCard
      title="Inventory Details"
      subtitle="Products & Batches"
      icon={<Package size={24} color="#9333EA" />}
      bg="#F3E8FF"
      borderColor="#D8B4FE"
      onPress={() => onNavigate('inventory')}
    />
    <MenuCard
      title="Expiry Alerts"
      subtitle="Expiring & Low Stock"
      icon={<AlertTriangle size={24} color="#DC2626" />}
      bg="#FEE2E2"
      borderColor="#FCA5A5"
      onPress={() => onNavigate('expiry')}
    />

    {/* Recent Activity — each row is its own rounded card (Figma style) */}
    <View style={styles.activitySection}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activityList}>
        <ActivityRow action="Stock Received" item="Rabies Vaccine" qty="+50" time="2h ago" type="success" />
        <ActivityRow action="Stock Issued (FEFO)" item="Multivitamins" qty="-20" time="4h ago" type="info" />
        <ActivityRow action="Stock Adjustment" item="Tick & Flea" qty="-5" time="1d ago" type="warning" />
      </View>
    </View>
  </View>
);

export default function StaffDashboard({ username }: { username: string }) {
  const [activeScreen, setActiveScreen] = useState('home');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" translucent={false} />
      {/* Blue Header — paddingTop accounts for Android status bar */}
      <View style={styles.headerWrapper}>
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {/* Left: Menu (home) or ArrowLeft (sub-screen) */}
              {activeScreen === 'home' ? (
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={() => setSidebarVisible(true)}
                >
                  <Menu size={24} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={() => setActiveScreen('home')}
                >
                  <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
              )}

              {/* Center: Brand */}
              <View style={styles.brandGroup}>
                <Activity size={22} color="white" />
                <View>
                  <Text style={styles.brandTitle}>VetriTrack</Text>
                  <Text style={styles.brandSub}>Staff Portal</Text>
                </View>
              </View>

              {/* Right: Home button on sub-screens, spacer on home */}
              {activeScreen !== 'home' ? (
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={() => setActiveScreen('home')}
                >
                  <Home size={22} color="white" />
                </TouchableOpacity>
              ) : (
                <View style={styles.headerIconBtn} />
              )}
            </View>
          </View>
        </SafeAreaView>
      </View>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        username={username}
        onLogout={logout}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeScreen === 'home' ? (
          <HomeScreen onNavigate={setActiveScreen} />
        ) : (
          <View style={styles.placeholderScreen}>
            <Text style={{ color: '#64748B', fontSize: 16 }}>Screen: {activeScreen}</Text>
            <TouchableOpacity onPress={() => setActiveScreen('home')} style={styles.backButton}>
              <Text style={{ color: 'white', fontWeight: '600' }}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// MenuCard — shadow wrapper separates elevation from border (fixes Android glitch)
const MenuCard = ({ title, subtitle, icon, bg, borderColor, onPress }: any) => (
  <View style={styles.menuCardShadow}>
    <TouchableOpacity
      style={[styles.menuCard, { borderColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        {icon}
      </View>
      <View style={styles.menuTextGroup}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#94A3B8" />
    </TouchableOpacity>
  </View>
);

// ActivityRow — each row is its own rounded bg-gray-50 card (Figma style)
const ActivityRow = ({ action, item, qty, time, type }: any) => {
  const badgeStyle =
    type === 'success' ? styles.badgeSuccess :
    type === 'warning' ? styles.badgeWarning :
    styles.badgeInfo;
  const badgeTextStyle =
    type === 'success' ? styles.badgeTextSuccess :
    type === 'warning' ? styles.badgeTextWarning :
    styles.badgeTextInfo;

  return (
    <View style={styles.activityRow}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={styles.activityAction} numberOfLines={1}>{action}</Text>
        <Text style={styles.activityItem} numberOfLines={1}>{item}</Text>
      </View>
      <View style={{ alignItems: 'flex-end', flexShrink: 0, marginLeft: 8 }}>
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, badgeTextStyle]}>{qty}</Text>
        </View>
        <Text style={styles.activityTime}>{time}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  headerWrapper: { backgroundColor: '#2563EB' },
  header: { paddingVertical: 14, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerIconBtn: { padding: 6, width: 40, alignItems: 'center' },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  brandSub: { color: '#BFDBFE', fontSize: 11 },

  // Scroll
  scrollContainer: { padding: 16, paddingBottom: 80 },
  homeContent: { gap: 12 },

  // Stats — full border (matches Figma border-blue-200 / border-red-200)
  statsGrid: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statCardBlue: { borderColor: '#BFDBFE' },
  statCardRed: { borderColor: '#FECACA' },
  statHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statValue: { fontSize: 26, fontWeight: 'bold' },

  // Menu Cards — shadow wrapper (elevation) is separate from the bordered card
  // This is the fix for Android border glitch where elevation eats the border
  menuCardShadow: {
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  iconBox: { padding: 12, borderRadius: 12, marginRight: 14 },
  menuTextGroup: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  menuSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },

  // Activity — each row is its own rounded card
  activitySection: { marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 10 },
  activityList: { gap: 8 },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
  },
  activityAction: { fontSize: 13, fontWeight: '600', color: '#0F172A' },
  activityItem: { fontSize: 12, color: '#64748B', marginTop: 2 },

  // Badges — match Figma variant styles
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  badgeSuccess: { backgroundColor: '#DCFCE7' },
  badgeTextSuccess: { color: '#166534' },
  badgeInfo: { backgroundColor: '#DBEAFE' },
  badgeTextInfo: { color: '#1D4ED8' },
  badgeWarning: { backgroundColor: '#FEE2E2' },
  badgeTextWarning: { color: '#991B1B' },
  activityTime: { fontSize: 10, color: '#94A3B8', marginTop: 4 },

  // Placeholder screen
  placeholderScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  backButton: { backgroundColor: '#2563EB', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginTop: 16 },

  // Sidebar Modal — slides from left
  modalOverlay: { flex: 1, flexDirection: 'row' },
  sidebarContent: {
    width: width * 0.72,
    backgroundColor: 'white',
    height: '100%',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 4, height: 0 },
  },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sidebarBrandTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginLeft: 8 },
  closeBtn: { padding: 4 },
  userInfoBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  userLabel: { fontSize: 12, color: '#1D4ED8' },
  userName: { fontSize: 17, fontWeight: 'bold', color: '#1E3A8A', marginTop: 4 },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 10,
  },
  roleText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  sidebarActions: { padding: 20, paddingBottom: 32 },
  sidebarLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  sidebarLogoutText: { color: '#DC2626', fontWeight: 'bold', fontSize: 15 },
});
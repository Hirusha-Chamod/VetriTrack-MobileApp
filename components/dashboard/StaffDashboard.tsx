import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/store/useAuthStore';
import { router } from 'expo-router';
import {
    Activity,
    AlertTriangle,
    ArrowUpDown,
    Calendar,
    ChevronRight,
    ClipboardList,
    Clock,
    FileText,
    Lightbulb,
    LogOut,
    Package,
    UserCircle2,
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

// --- Mock Data (Replace with API data later) ---
const MOCK_TASKS = [
  { id: '1', title: 'Conduct Monthly Stock Count', status: 'assigned', dueDate: '2026-02-08', assignedTo: 'user1' },
  { id: '2', title: 'Follow up on PO-2026-001', status: 'in-progress', dueDate: '2026-02-01', assignedTo: 'user1' }
];

// --- Sidebar Component ---
const Sidebar = ({ visible, onClose, username, onLogout, theme }: any) => {
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
        <Animated.View style={[styles.sidebarContent, { backgroundColor: theme.card, transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {Platform.OS === 'android' && <View style={{ height: StatusBar.currentHeight }} />}
            <View style={[styles.sidebarHeader, { borderBottomColor: theme.border }]}>
              <View style={styles.brandGroup}>
                <Activity size={24} color={theme.primary} />
                <Text style={[styles.sidebarBrandTitle, { color: theme.primaryDark, fontFamily: Fonts?.bold }]}>VetriTrack</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={22} color={theme.icon} />
              </TouchableOpacity>
            </View>

            <View style={[styles.userInfoBox, { backgroundColor: theme.blue50, borderColor: theme.blue100 }]}>
              <Text style={[styles.userLabel, { color: theme.blue700, fontFamily: Fonts?.sans }]}>Logged in as</Text>
              <Text style={[styles.userName, { color: theme.primaryDark, fontFamily: Fonts?.bold }]}>{username}</Text>
              <View style={[styles.roleBadge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.roleText, { fontFamily: Fonts?.bold }]}>Staff</Text>
              </View>
            </View>

            <View style={styles.sidebarActions}>
              <TouchableOpacity style={[styles.sidebarLogoutBtn, { backgroundColor: theme.dangerLight, borderColor: theme.dangerLight }]} onPress={() => { onClose(); onLogout(); }}>
                <LogOut size={18} color={theme.danger} />
                <Text style={[styles.sidebarLogoutText, { color: theme.danger, fontFamily: Fonts?.bold }]}>Logout</Text>
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

export default function StaffDashboard({ username }: { username: string }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const logout = useAuthStore((state) => state.logout);

  // Hardcoded counts for now, matching your design
  const lowStockCount = 4;
  const recommendationsCount = 8;
  const expiringSoonCount = 0;
  
  const myTasks = MOCK_TASKS;
  const overdueTasksCount = myTasks.filter(t => new Date(t.dueDate) < new Date()).length;

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return { label: 'Assigned', bg: theme.blue100, text: theme.blue700 };
      case 'in-progress':
        return { label: 'In Progress', bg: theme.purple100, text: theme.purple700 };
      case 'completed':
        return { label: 'Completed', bg: theme.green100, text: theme.green700 };
      default:
        return { label: status, bg: theme.gray100, text: theme.gray700 };
    }
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  const handleNavigate = (destination: string) => {
    console.log(`Maps to ${destination}`);
    // Replace with actual Expo Router logic later: router.push(`/${destination}`)
  };

  const kpis = [
    { label: 'Low Stock', value: lowStockCount, icon: AlertTriangle, color: theme.orange600, destination: 'low-stock' },
    { label: 'Recommendations', value: recommendationsCount, icon: Lightbulb, color: theme.blue600, destination: 'recommendations' },
    { label: 'Expiring Soon', value: expiringSoonCount, icon: Clock, color: theme.red600, destination: 'expiry-management' }
  ];

  const navCards = [
    { title: 'Low Stock Items', description: 'View items below reorder point', icon: AlertTriangle, bg: theme.orange50, iconColor: theme.orange600, destination: 'low-stock' },
    { title: 'Expiry Management', description: 'Track expiring and expired items', icon: Calendar, bg: theme.red50, iconColor: theme.red600, destination: 'expiry-management' },
    { title: 'Inventory', description: 'Search and filter clinic stock', icon: Package, bg: theme.gray50, iconColor: theme.gray600, destination: 'inventory' },
    { title: 'Smart Recommendations', description: 'AI-powered reorder suggestions', icon: Lightbulb, bg: theme.blue50, iconColor: theme.blue600, destination: 'recommendations' },
    { title: 'Transactions Hub', description: 'Receive, Issue, & Adjust stock', icon: ArrowUpDown, bg: theme.purple50, iconColor: theme.purple600, destination: 'transactions-hub' },
    { title: 'My Requests', description: 'Track reorder request status', icon: FileText, bg: theme.green50, iconColor: theme.green600, destination: 'my-requests' }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} translucent={false} />
      
      {/* Welcome Header */}
      <View style={[styles.headerWrapper, { backgroundColor: theme.primary }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerTextGroup}>
              <Text style={[styles.welcomeText, { fontFamily: Fonts?.sans }]}>Welcome back,</Text>
              <Text style={[styles.userNameText, { fontFamily: Fonts?.bold }]}>{username}</Text>
              <Text style={[styles.roleSubText, { fontFamily: Fonts?.sans }]}>Staff Member</Text>
            </View>
      <TouchableOpacity 
  style={[styles.profileBtn, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
  onPress={() => router.push('/profile')} 
>
  <UserCircle2 size={28} color="white" />
</TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        username={username}
        onLogout={logout}
        theme={theme}
      />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          {kpis.map((kpi, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.kpiCard, { backgroundColor: theme.card }]}
              onPress={() => handleNavigate(kpi.destination)}
              activeOpacity={0.8}
            >
              <kpi.icon size={24} color={kpi.color} style={{ marginBottom: 8 }} />
              <Text style={[styles.kpiValue, { color: theme.textPrimary, fontFamily: Fonts?.bold }]}>{kpi.value}</Text>
              <Text style={[styles.kpiLabel, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>{kpi.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* My Tasks Section */}
        {myTasks.length > 0 && (
          <View style={[styles.tasksCard, { backgroundColor: theme.card }]}>
            <View style={styles.tasksHeader}>
              <View style={styles.tasksHeaderLeft}>
                <ClipboardList size={20} color={theme.primary} />
                <Text style={[styles.tasksTitle, { color: theme.textPrimary, fontFamily: Fonts?.bold }]}>My Tasks</Text>
              </View>
              <TouchableOpacity onPress={() => handleNavigate('staff-tasks-list')} style={styles.viewAllBtn}>
                <Text style={[styles.viewAllText, { color: theme.primary, fontFamily: Fonts?.sans }]}>View all</Text>
                <ChevronRight size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.tasksSubtitle, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>
              You have {myTasks.length} assigned {overdueTasksCount > 0 && `/ ${overdueTasksCount} overdue`}
            </Text>

            <View style={styles.tasksList}>
              {myTasks.slice(0, 2).map((task) => {
                const badge = getTaskStatusBadge(task.status);
                const taskOverdue = isOverdue(task.dueDate);
                return (
                  <View key={task.id} style={[styles.taskItem, { backgroundColor: theme.gray50, borderColor: theme.border }]}>
                    <View style={styles.taskItemHeader}>
                      <Text style={[styles.taskItemTitle, { color: theme.textPrimary, fontFamily: Fonts?.bold }]} numberOfLines={1}>
                        {task.title}
                      </Text>
                      <View style={styles.badgesGroup}>
                        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                          <Text style={[styles.badgeText, { color: badge.text, fontFamily: Fonts?.bold }]}>{badge.label}</Text>
                        </View>
                        {taskOverdue && (
                          <View style={[styles.badge, { backgroundColor: theme.dangerLight }]}>
                            <Text style={[styles.badgeText, { color: theme.danger, fontFamily: Fonts?.bold }]}>Overdue</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={[styles.taskDueDate, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>
                      Due: {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Navigation Cards */}
        <View style={styles.navCardsContainer}>
          {navCards.map((card, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.navCard, { backgroundColor: theme.card }]}
              onPress={() => handleNavigate(card.destination)}
              activeOpacity={0.8}
            >
              <View style={[styles.navCardIconBox, { backgroundColor: card.bg }]}>
                <card.icon size={24} color={card.iconColor} strokeWidth={2} />
              </View>
              <View style={styles.navCardTextGroup}>
                <Text style={[styles.navCardTitle, { color: theme.textPrimary, fontFamily: Fonts?.bold }]}>{card.title}</Text>
                <Text style={[styles.navCardSub, { color: theme.textSecondary, fontFamily: Fonts?.sans }]} numberOfLines={1}>
                  {card.description}
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
  container: { flex: 1 },
  
  // Header
  headerWrapper: { paddingBottom: 24 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 24 },
  headerTextGroup: { flex: 1 },
  welcomeText: { color: 'white', fontSize: 24, marginBottom: 4 },
  userNameText: { color: 'white', fontSize: 20, opacity: 0.9 },
  roleSubText: { color: 'white', fontSize: 14, opacity: 0.75, marginTop: 4 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  scrollContainer: { padding: 16, paddingBottom: 80 },

  // KPI Grid
  kpiGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  kpiCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiValue: { fontSize: 24, marginBottom: 4 },
  kpiLabel: { fontSize: 12, textAlign: 'center' },

  // Tasks
  tasksCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tasksHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tasksHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tasksTitle: { fontSize: 16 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { fontSize: 14 },
  tasksSubtitle: { fontSize: 14, marginBottom: 12 },
  tasksList: { gap: 8 },
  taskItem: { padding: 12, borderRadius: 8, borderWidth: 1 },
  taskItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  taskItemTitle: { fontSize: 14, flex: 1 },
  badgesGroup: { flexDirection: 'row', gap: 6, flexShrink: 0 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { fontSize: 10 },
  taskDueDate: { fontSize: 12 },

  // Nav Cards
  navCardsContainer: { gap: 12 },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  navCardIconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  navCardTextGroup: { flex: 1 },
  navCardTitle: { fontSize: 16, marginBottom: 2 },
  navCardSub: { fontSize: 14 },

  // Sidebar Modal
  modalOverlay: { flex: 1, flexDirection: 'row' },
  sidebarContent: { width: SIDEBAR_WIDTH, height: '100%', elevation: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 4, height: 0 } },
  modalBackground: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  sidebarBrandTitle: { fontSize: 18, marginLeft: 8 },
  brandGroup: { flexDirection: 'row', alignItems: 'center' },
  closeBtn: { padding: 4 },
  userInfoBox: { margin: 16, padding: 16, borderRadius: 12, borderWidth: 1 },
  userLabel: { fontSize: 12 },
  userName: { fontSize: 17, marginTop: 4 },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginTop: 10 },
  roleText: { color: 'white', fontSize: 12 },
  sidebarActions: { padding: 20, paddingBottom: 32 },
  sidebarLogoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 10, borderWidth: 1 },
  sidebarLogoutText: { fontSize: 15 },
});
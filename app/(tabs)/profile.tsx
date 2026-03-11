import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authApi, UserProfile } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { useRouter } from 'expo-router';
import { ArrowLeft, Home, LogOut, Mail, MoreVertical, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const showToast = useToastStore((state) => state.showToast);
  
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
console.log('Current user from store:', user);
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await authApi.getUserById(user.id);
      setProfileData(data);
    } catch (error: any) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    logout();
  };

  const navigateToDashboard = () => {
    setShowDropdown(false);
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} translucent={false} />

      <View style={[styles.headerWrapper, { backgroundColor: theme.primary }]}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <TouchableOpacity 
                style={styles.iconButton} 
                onPress={() => router.back()}
              >
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { fontFamily: Fonts?.bold }]}>Profile</Text>
            </View>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setShowDropdown(true)}
            >
              <MoreVertical size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.profileCenter}>
                <View style={[styles.avatarContainer, { backgroundColor: theme.blue100 }]}>
                  <User size={40} color={theme.primary} strokeWidth={2} />
                </View>
                
                <Text style={[styles.nameText, { color: theme.textPrimary, fontFamily: Fonts?.bold }]}>
                  {profileData?.fullName || user?.username}
                </Text>

                <View style={[styles.roleBadge, { backgroundColor: theme.blue50 }]}>
                  <Text style={[styles.roleBadgeText, { color: theme.blue700, fontFamily: Fonts?.sans }]}>
                    {profileData?.role === 'owner' ? 'Owner' : 'Staff Member'}
                  </Text>
                </View>

                <View style={styles.emailRow}>
                  <Mail size={16} color={theme.textSecondary} />
                  <Text style={[styles.emailText, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>
                    {profileData?.email || 'No email provided'}
                  </Text>
                </View>

                <Text style={[styles.usernameText, { color: theme.textMuted, fontFamily: Fonts?.sans }]}>
                  @{profileData?.username || user?.username}
                </Text>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: Fonts?.bold }]}>
                Account Details
              </Text>
              
              <View style={styles.detailsList}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>User ID</Text>
                  <Text style={[styles.detailValue, { color: theme.textPrimary, fontFamily: Fonts?.sans }]}>
                    {profileData?._id?.substring(0, 8).toUpperCase() || user?.id.substring(0, 8).toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.detailRow, { borderTopColor: theme.border, borderTopWidth: 1 }]}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>Role</Text>
                  <Text style={[styles.detailValue, { color: theme.textPrimary, fontFamily: Fonts?.sans, textTransform: 'capitalize' }]}>
                    {profileData?.role || user?.role}
                  </Text>
                </View>
                <View style={[styles.detailRow, { borderTopColor: theme.border, borderTopWidth: 1 }]}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>Username</Text>
                  <Text style={[styles.detailValue, { color: theme.textPrimary, fontFamily: Fonts?.sans }]}>
                    {profileData?.username || user?.username}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: theme.danger }]}
              onPress={() => setShowLogoutDialog(true)}
              activeOpacity={0.8}
            >
              <LogOut size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={[styles.logoutButtonText, { fontFamily: Fonts?.bold }]}>Log Out</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>

      <Modal visible={showDropdown} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.dropdownOverlay}>
            <View style={[styles.dropdownContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity style={styles.dropdownItem} onPress={navigateToDashboard}>
                <Home size={18} color={theme.textPrimary} />
                <Text style={[styles.dropdownText, { color: theme.textPrimary, fontFamily: Fonts?.sans }]}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => setShowDropdown(false)}>
                <User size={18} color={theme.textPrimary} />
                <Text style={[styles.dropdownText, { color: theme.textPrimary, fontFamily: Fonts?.sans }]}>Profile</Text>
              </TouchableOpacity>
              <View style={[styles.dropdownSeparator, { backgroundColor: theme.border }]} />
              <TouchableOpacity 
                style={styles.dropdownItem} 
                onPress={() => {
                  setShowDropdown(false);
                  setShowLogoutDialog(true);
                }}
              >
                <LogOut size={18} color={theme.danger} />
                <Text style={[styles.dropdownText, { color: theme.danger, fontFamily: Fonts?.sans }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={showLogoutDialog} transparent animationType="fade">
        <View style={styles.dialogOverlay}>
          <View style={[styles.dialogContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.dialogTitle, { color: theme.textPrimary, fontFamily: Fonts?.bold }]}>
              Log out?
            </Text>
            <Text style={[styles.dialogDescription, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>
              Are you sure you want to log out of VetriTrack?
            </Text>
            
            <View style={styles.dialogFooter}>
              <TouchableOpacity 
                style={[styles.dialogBtn, { borderColor: theme.border, borderWidth: 1 }]} 
                onPress={() => setShowLogoutDialog(false)}
              >
                <Text style={[styles.dialogBtnText, { color: theme.textPrimary, fontFamily: Fonts?.sans }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.dialogBtn, { backgroundColor: theme.danger }]} 
                onPress={handleLogoutConfirm}
              >
                <Text style={[styles.dialogBtnText, { color: 'white', fontFamily: Fonts?.bold }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerWrapper: { paddingBottom: 16 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconButton: { padding: 8, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  headerTitle: { color: 'white', fontSize: 20 },
  
  scrollContent: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  
  card: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  profileCenter: { alignItems: 'center', padding: 24 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  nameText: { fontSize: 20, marginBottom: 4 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, marginBottom: 8 },
  roleBadgeText: { fontSize: 14 },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  emailText: { fontSize: 14 },
  usernameText: { fontSize: 14, marginTop: 4 },

  sectionTitle: { fontSize: 16, padding: 16, paddingBottom: 8 },
  detailsList: { paddingHorizontal: 16, paddingBottom: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14 },

  logoutButton: { flexDirection: 'row', height: 52, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  logoutButtonText: { color: 'white', fontSize: 16 },

  dropdownOverlay: { flex: 1, backgroundColor: 'transparent' },
  dropdownContent: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 100 : 70, 
    right: 16, 
    width: 200, 
    borderRadius: 8, 
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  dropdownText: { fontSize: 14 },
  dropdownSeparator: { height: 1, width: '100%' },

  dialogOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  dialogContent: { width: '100%', borderRadius: 12, padding: 24 },
  dialogTitle: { fontSize: 18, marginBottom: 8 },
  dialogDescription: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  dialogFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  dialogBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 6, minWidth: 80, alignItems: 'center' },
  dialogBtnText: { fontSize: 14 },
});
import { useAuthStore } from '@/store/useAuthStore';
import {
    AlertTriangle,
    ChevronRight,
    Clock,
    LogOut,
    Package,
    PawPrint
} from 'lucide-react-native';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function OwnerDashboard({ username }: { username: string }) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoGroup}>
            <View style={styles.iconCircle}>
              <PawPrint size={24} color="white" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Pet Shop Warehouse</Text>
              <Text style={styles.headerSubtitle}>Staff Portal</Text>
            </View>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <LogOut size={18} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Welcome, {username}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Stats Grid */}
        <View style={styles.grid}>
          <StatCard 
            title="Total Items" 
            value="147" 
            label="Active stock" 
            icon={<Package size={24} color="#2563EB" />}
            borderColor="#DBEAFE"
            textColor="#2563EB"
          />
          <StatCard 
            title="Expiring Soon" 
            value="8" 
            label="Within 30 days" 
            icon={<Clock size={24} color="#EA580C" />}
            borderColor="#FFEDD5"
            textColor="#EA580C"
          />
          <StatCard 
            title="Expired Items" 
            value="3" 
            label="Needs attention" 
            icon={<AlertTriangle size={24} color="#DC2626" />}
            borderColor="#FEE2E2"
            textColor="#DC2626"
          />
        </View>

        {/* Action List Placeholder */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ActionItem title="Transaction Hub" subtitle="Issue or receive stock" />
        <ActionItem title="Smart Recommendations" subtitle="Inventory optimization" />
        <ActionItem title="Full Inventory" subtitle="View and search all items" />
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Stat Card
function StatCard({ title, value, label, icon, borderColor, textColor }: any) {
  return (
    <View style={[styles.card, { borderLeftColor: textColor, borderLeftWidth: 4 }]}>
      <View style={styles.cardHeader}>
        {icon}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={[styles.cardValue, { color: textColor }]}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

// Reusable Action Item
function ActionItem({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <TouchableOpacity style={styles.actionItem}>
      <View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#94A3B8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: '#2563EB',
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 8, borderRadius: 12 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: '#DBEAFE', fontSize: 12 },
  welcomeText: { color: 'white', marginTop: 15, fontSize: 16, opacity: 0.9 },
  logoutBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10 },
  scrollContent: { padding: 20 },
  grid: { gap: 16, marginBottom: 24 },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  cardValue: { fontSize: 28, fontWeight: 'bold' },
  cardLabel: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E3A8A', marginBottom: 16 },
  actionItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  actionSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
});
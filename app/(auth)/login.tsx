import { authApi } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Activity } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'staff' | 'owner'>('owner');
  const [loading, setLoading] = useState(false);
  
  // New state for inline validation
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  const login = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToast);

  const validate = () => {
    let valid = true;
    let newErrors: { username?: string; password?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
      valid = false;
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    // Clear previous errors
    setErrors({});

    if (!validate()) return;

    setLoading(true);
    try {
    const data = await authApi.login(username, password);
    login({
      username: data.user.username,
      role: data.user.role,
      token: data.accessToken,
    });
    showToast(`Welcome back, ${data.user.username}!`, 'success');
  } catch (error: any) {
      showToast(error.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Activity size={40} color="white" />
            </View>
            <Text style={styles.title}>VetriTrack</Text>
            <Text style={styles.subtitle}>Smart Inventory Management</Text>
          </View>

          <View style={styles.cardContent}>
            {/* Role Toggle Switch */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Role</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleTab, role === 'staff' && styles.activeTab]}
                  onPress={() => setRole('staff')}
                >
                  <Text style={[styles.toggleText, role === 'staff' && styles.activeToggleText]}>
                    Staff
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleTab, role === 'owner' && styles.activeTab]}
                  onPress={() => setRole('owner')}
                >
                  <Text style={[styles.toggleText, role === 'owner' && styles.activeToggleText]}>
                    Owner
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={[styles.input, errors.username && styles.inputError]}
                placeholder="Enter username"
                placeholderTextColor="#94A3B8"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  if (errors.username) setErrors({ ...errors, username: undefined });
                }}
                autoCapitalize="none"
              />
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Enter password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>VetriTrack v1.0</Text>
          <Text style={styles.footerSubText}>Veterinary Inventory Management</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563EB',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    backgroundColor: '#F0F7FF',
    paddingVertical: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconBox: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  subtitle: {
    fontSize: 14,
    color: '#1D4ED8',
    marginTop: 4,
  },
  cardContent: {
    padding: 24,
    gap: 16, // Slightly reduced gap to accommodate error messages
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    padding: 4,
    borderRadius: 8,
    height: 48,
  },
  toggleTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E40AF',
  },
  activeToggleText: {
    color: 'white',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  inputError: {
    borderColor: '#EF4444', // Red border for error
    backgroundColor: '#FEF2F2', // Light red tint
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 2,
    marginLeft: 4,
  },
  demoBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#BFDBFE',
    marginTop: 8,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 2,
  },
  demoText: {
    fontSize: 12,
    color: '#1E40AF',
  },
  loginButton: {
    backgroundColor: '#2563EB',
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  footerSubText: {
    color: '#BFDBFE',
    fontSize: 12,
    marginTop: 4,
  },
});
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authApi } from '@/services/authService';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { AlertCircle, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const login = useAuthStore((state) => state.login);
  const showToast = useToastStore((state) => state.showToast);

  const handleRoleChange = (selectedRole: 'staff' | 'owner') => {
    setRole(selectedRole);
    if (selectedRole === 'owner') {
      setUsername('');
      setPassword('');
    } else {
      setUsername('');
      setPassword('');
    }
    setError('');
  };

  const handleLogin = async () => {
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Invalid credentials. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      login({
        username: data.user.username,
        role: data.user.role,
        token: data.accessToken,
        id: data.user.id, 
      });
      showToast(`Welcome back, ${data.user.username}!`, 'success');
    } catch (err: any) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.backgroundLightBlue }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={[styles.logo, { tintColor: theme.primary }]}
            resizeMode="contain"
          />
          <Text style={[styles.mainTitle, { color: theme.primaryDark, fontFamily: Fonts?.bold }]}>
            VetriTrack
          </Text>
          <Text style={[styles.mainSubtitle, { color: theme.primary, fontFamily: Fonts?.sans }]}>
            Veterinary Inventory System
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary, fontFamily: Fonts?.bold }]}>
            Welcome Back
          </Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary, fontFamily: Fonts?.sans }]}>
            Sign in to manage your inventory
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary, fontFamily: Fonts?.sans }]}>Login As</Text>
            <View style={[styles.toggleContainer, { backgroundColor: theme.backgroundLightBlue }]}>
              <TouchableOpacity
                style={[
                  styles.toggleTab,
                  role === 'staff' && [styles.activeTab, { backgroundColor: theme.white }],
                ]}
                onPress={() => handleRoleChange('staff')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { 
                      color: role === 'staff' ? theme.primary : 'rgba(37, 99, 235, 0.7)', 
                      fontFamily: Fonts?.sans,
                      fontWeight: role === 'staff' ? '600' : '400'
                    },
                  ]}
                >
                  Staff
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleTab,
                  role === 'owner' && [styles.activeTab, { backgroundColor: theme.white }],
                ]}
                onPress={() => handleRoleChange('owner')}
              >
                <Text
                  style={[
                    styles.toggleText,
                    { 
                      color: role === 'owner' ? theme.primary : 'rgba(37, 99, 235, 0.7)', 
                      fontFamily: Fonts?.sans,
                      fontWeight: role === 'owner' ? '600' : '400'
                    },
                  ]}
                >
                  Owner
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary, fontFamily: Fonts?.sans }]}>Username</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.white, borderColor: theme.inputBorder, color: theme.textPrimary, fontFamily: Fonts?.sans },
              ]}
              placeholder="Enter your username"
              placeholderTextColor={theme.inputPlaceholder}
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (error) setError('');
              }}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary, fontFamily: Fonts?.sans }]}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  { backgroundColor: theme.white, borderColor: theme.inputBorder, color: theme.textPrimary, fontFamily: Fonts?.sans },
                ]}
                placeholder="Enter your password"
                placeholderTextColor={theme.inputPlaceholder}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) setError('');
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.textMuted} />
                ) : (
                  <Eye size={20} color={theme.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View style={[styles.errorAlert, { backgroundColor: theme.dangerLight, borderColor: '#FECACA' }]}>
              <AlertCircle size={16} color={theme.danger} />
              <Text style={[styles.errorAlertText, { color: '#991B1B', fontFamily: Fonts?.sans }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={[styles.buttonText, { fontFamily: Fonts?.sans }]}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={[styles.forgotPasswordText, { color: theme.primary, fontFamily: Fonts?.sans }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <View style={[styles.divider, { borderBottomColor: theme.border }]} />

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 12,
  },
  mainTitle: {
    fontSize: 36,
  },
  mainSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleText: {
    fontSize: 14,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorAlertText: {
    fontSize: 14,
    marginLeft: 8,
  },
  loginButton: {
    height: 44,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
  },
  divider: {
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
  },
  demoText: {
    fontSize: 12,
    marginBottom: 8,
  },
  demoCredentialsContainer: {
    alignItems: 'center',
  },
  demoCredentials: {
    fontSize: 12,
    marginBottom: 4,
  },
});
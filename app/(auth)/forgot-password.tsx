import { Fonts } from "@/constants/theme";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // Zustand Store
  const { forgotPassword, verifyOtp, resetPassword, isLoading, error, clearError } =
    useAuthStore();

  // Local State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ─── STEP 1: SEND OTP ────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email) return;
    clearError();
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err) {
      // Error is handled by Zustand
    }
  };

  // ─── STEP 2: VERIFY OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return;
    clearError();
    try {
      await verifyOtp(email, otp);
      setStep(3);
    } catch (err) {
      // Error is handled by Zustand
    }
  };

  // ─── STEP 3: RESET PASSWORD ──────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      useAuthStore.setState({ error: "Passwords do not match" });
      return;
    }
    clearError();
    try {
      await resetPassword(email, otp, newPassword);
      setStep(4); // Success Step!
    } catch (err) {
      // Error is handled by Zustand
    }
  };

  // Dynamic Content based on current step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <View style={styles.iconCircle}>
              <Mail size={28} color="#818CF8" />
            </View>
            <Text style={[styles.title, { fontFamily: Fonts?.bold }]}>
              Reset Password
            </Text>
            <Text style={[styles.subtitle, { fontFamily: Fonts?.sans }]}>
              Enter your email to receive a password reset link
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontFamily: Fonts?.bold }]}>
                Email Address
              </Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="your.email@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  clearError();
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.btn, (!email || isLoading) && styles.btnDisabled]}
              onPress={handleSendOtp}
              disabled={!email || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={[styles.btnText, { fontFamily: Fonts?.bold }]}>
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <View style={styles.iconCircle}>
              <KeyRound size={28} color="#818CF8" />
            </View>
            <Text style={[styles.title, { fontFamily: Fonts?.bold }]}>
              Enter Verification Code
            </Text>
            <Text style={[styles.subtitle, { fontFamily: Fonts?.sans }]}>
              We've sent a 6-digit code to {email}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontFamily: Fonts?.bold }]}>
                6-Digit OTP
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.centerText,
                  error && styles.inputError,
                ]}
                placeholder="• • • • • •"
                value={otp}
                onChangeText={(text) => {
                  setOtp(text);
                  clearError();
                }}
                keyboardType="number-pad"
                maxLength={6}
                editable={!isLoading}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.btn,
                (otp.length < 6 || isLoading) && styles.btnDisabled,
              ]}
              onPress={handleVerifyOtp}
              disabled={otp.length < 6 || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={[styles.btnText, { fontFamily: Fonts?.bold }]}>
                  Verify Code
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.textBtn}
              onPress={() => setStep(1)}
              disabled={isLoading}
            >
              <Text style={[styles.textBtnText, { fontFamily: Fonts?.bold }]}>
                Change Email Address
              </Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <View style={styles.iconCircle}>
              <Lock size={28} color="#818CF8" />
            </View>
            <Text style={[styles.title, { fontFamily: Fonts?.bold }]}>
              Create New Password
            </Text>
            <Text style={[styles.subtitle, { fontFamily: Fonts?.sans }]}>
              Your new password must be different from previous used passwords.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontFamily: Fonts?.bold }]}>
                New Password
              </Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    error && styles.inputError,
                  ]}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    clearError();
                  }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#9CA3AF" />
                  ) : (
                    <Eye size={20} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { fontFamily: Fonts?.bold }]}>
                Confirm Password
              </Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError();
                }}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[
                styles.btn,
                (!newPassword || !confirmPassword || isLoading) &&
                  styles.btnDisabled,
              ]}
              onPress={handleResetPassword}
              disabled={!newPassword || !confirmPassword || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={[styles.btnText, { fontFamily: Fonts?.bold }]}>
                  Reset Password
                </Text>
              )}
            </TouchableOpacity>
          </>
        );

      case 4:
        return (
          <>
            <View style={[styles.iconCircle, { backgroundColor: "#DCFCE7" }]}>
              <CheckCircle2 size={36} color="#16A34A" />
            </View>
            <Text style={[styles.title, { fontFamily: Fonts?.bold }]}>
              All Done!
            </Text>
            <Text style={[styles.subtitle, { fontFamily: Fonts?.sans }]}>
              Your password has been successfully reset. You can now log in with
              your new password.
            </Text>

            <TouchableOpacity
              style={[styles.btn, { marginTop: 24 }]}
              onPress={() => router.replace("/" as any)} // Goes back to login
            >
              <Text style={[styles.btnText, { fontFamily: Fonts?.bold }]}>
                Back to Login
              </Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#EFF6FF" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Top Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#2563EB" />
            <Text style={[styles.backText, { fontFamily: Fonts?.bold }]}>
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={styles.content}>
          <View style={styles.card}>{renderStepContent()}</View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EFF6FF", // The light blue background from Figma
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 20 : 10,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    fontSize: 15,
    color: "#2563EB",
    marginLeft: 6,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E0E7FF", // Light indigo circle
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    width: "100%",
    backgroundColor: "#F3F4F6", // Light gray fill matching Figma
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: "#111827",
  },
  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 48, // Make room for eye icon
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
  },
  centerText: {
    textAlign: "center",
    letterSpacing: 4,
    fontSize: 20,
    fontWeight: "600",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 13,
    marginBottom: 16,
    textAlign: "center",
  },
  btn: {
    width: "100%",
    backgroundColor: "#818CF8", // Soft indigo from the mockup
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: "white",
    fontSize: 16,
  },
  textBtn: {
    marginTop: 16,
    padding: 8,
  },
  textBtnText: {
    color: "#6B7280",
    fontSize: 14,
  },
});
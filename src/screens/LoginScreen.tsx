import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { EyeIcon, EyeOffIcon, Mail01Icon, LockIcon } from "@hugeicons/core-free-icons";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { setAuthenticated } from "../store/authSlice";
import { login } from "../api/Auth/AuthAPI";
import { tokens } from "../theme/tokens";
import Banner, { type BannerVariant } from "../components/Banner";

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorVariant, setErrorVariant] = useState<BannerVariant>("destructive");
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await login(usernameOrEmail, password, true);
    setSubmitting(false);
    if (result.status === "success") {
      dispatch(setAuthenticated());
    } else if (result.status === "mfaRequired") {
      setErrorVariant("warning");
      setError("This account requires multi-factor authentication, which isn't supported in this app yet.");
    } else {
      setErrorVariant("destructive");
      setError(result.message ?? "Login failed.");
    }
  }

  return (
    <LinearGradient colors={[tokens.brandC, tokens.brandB, tokens.brandA]} style={styles.container}>
      <View style={styles.decorCircleTop} pointerEvents="none" />
      <View style={styles.decorCircleBottom} pointerEvents="none" />

      <Banner message={error} variant={errorVariant} onDismiss={() => setError(null)} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandBlock}>
            <Image
              source={require("../../assets/peoplehub-logo-white.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.essPill}>
              <Text style={styles.essPillText}>Employee Self Service</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to access your account</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Username or email</Text>
              <View style={[styles.inputRow, usernameFocused && styles.inputRowFocused]}>
                <HugeiconsIcon icon={Mail01Icon} size={18} color={tokens.mutedForeground} strokeWidth={1.8} />
                <TextInput
                  style={styles.input}
                  value={usernameOrEmail}
                  onChangeText={setUsernameOrEmail}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="Enter your username or email"
                  placeholderTextColor={tokens.mutedForeground}
                  testID="username-input"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, passwordFocused && styles.inputRowFocused]}>
                <HugeiconsIcon icon={LockIcon} size={18} color={tokens.mutedForeground} strokeWidth={1.8} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!passwordVisible}
                  placeholder="Enter your password"
                  placeholderTextColor={tokens.mutedForeground}
                  testID="password-input"
                />
                <Pressable
                  hitSlop={8}
                  onPress={() => setPasswordVisible((v) => !v)}
                  accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
                  testID="password-visibility-toggle"
                >
                  <HugeiconsIcon
                    icon={passwordVisible ? EyeOffIcon : EyeIcon}
                    size={19}
                    color={tokens.mutedForeground}
                    strokeWidth={1.8}
                  />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: tokens.brandC },
                pressed && styles.buttonPressed,
                submitting && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={submitting}
              testID="login-button"
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
            </Pressable>
          </View>

          <Text style={styles.footer}>Victory Information PVT LTD</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  decorCircleTop: {
    position: "absolute",
    top: -90,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  decorCircleBottom: {
    position: "absolute",
    bottom: -120,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  brandBlock: { alignItems: "center", marginBottom: 20 },
  logoImage: { width: 108, height: 108, marginBottom: 2 },
  essPill: {
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  essPillText: { fontSize: 12.5, color: "#fff", fontWeight: "600", letterSpacing: 0.4 },
  card: {
    backgroundColor: tokens.card,
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", color: tokens.foreground },
  cardSubtitle: { fontSize: 14, color: tokens.mutedForeground, marginTop: 3, marginBottom: 26 },
  field: { marginBottom: 18 },
  label: { color: tokens.foreground, marginBottom: 7, fontSize: 14, fontWeight: "600" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: tokens.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: tokens.border,
    paddingHorizontal: 14,
  },
  inputRowFocused: { borderColor: tokens.brandC, backgroundColor: tokens.card },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: tokens.foreground,
    ...(Platform.OS === "web" ? ({ outlineStyle: "none", outlineWidth: 0 } as object) : {}),
  },
  button: {
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: "center",
    marginTop: 10,
    shadowColor: tokens.brandB,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonPressed: { opacity: 0.85 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 17 },
  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 24,
    fontWeight: "500",
  },
});

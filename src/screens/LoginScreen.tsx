import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { EyeIcon, EyeOffIcon } from "@hugeicons/core-free-icons";
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
    <LinearGradient colors={[tokens.brandA, tokens.brandB]} style={styles.container}>
      <Banner message={error} variant={errorVariant} onDismiss={() => setError(null)} />

      <Text style={styles.title}>PeopleHub</Text>
      <Text style={styles.subtitle}>Employee Self Service</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Username or email</Text>
        <TextInput
          style={styles.input}
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          testID="username-input"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            testID="password-input"
          />
          <Pressable
            style={styles.eyeButton}
            onPress={() => setPasswordVisible((v) => !v)}
            accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
            testID="password-visibility-toggle"
          >
            <HugeiconsIcon icon={passwordVisible ? EyeOffIcon : EyeIcon} size={19} color="#666" strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      <Pressable
        style={[styles.button, { backgroundColor: tokens.brandC }]}
        onPress={handleSubmit}
        disabled={submitting}
        testID="login-button"
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#cfe3f5", textAlign: "center", marginBottom: 32 },
  field: { marginBottom: 16 },
  label: { color: "#fff", marginBottom: 6, fontSize: 13 },
  input: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingRight: 8,
  },
  passwordInput: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  eyeButton: { padding: 6 },
  button: { borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

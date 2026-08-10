import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { setAuthenticated } from "../store/authSlice";
import { login } from "../api/Auth/AuthAPI";
import { brand } from "../theme";

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const result = await login(usernameOrEmail, password);
    setSubmitting(false);
    if (result.status === "success") {
      dispatch(setAuthenticated());
    } else {
      setError(result.message ?? "Login failed.");
    }
  }

  return (
    <View style={styles.container}>
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
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          testID="password-input"
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting} testID="login-button">
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: brand.dark2 },
  title: { fontSize: 28, fontWeight: "700", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#cfe3f5", textAlign: "center", marginBottom: 32 },
  field: { marginBottom: 16 },
  label: { color: "#fff", marginBottom: 6, fontSize: 13 },
  input: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  error: { color: "#ffb3b3", marginBottom: 12, textAlign: "center" },
  button: { backgroundColor: brand.solid, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

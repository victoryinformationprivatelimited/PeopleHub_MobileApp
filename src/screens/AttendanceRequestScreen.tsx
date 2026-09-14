import { useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { requestAttendance } from "../api/Attendance/AttendanceAPI";
import { moduleColor, neutral, semantic } from "../theme";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { SentIcon } from "@hugeicons/core-free-icons";

const accent = moduleColor.attendance;

type Props = NativeStackScreenProps<RootStackParamList, "AttendanceRequest">;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function nowHHmm() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** For correcting or adding a missed punch on a specific date+time — the mobile counterpart of
 * PeopleHub-ESS's attendance-correction flow, wired to the RequestAttendance endpoint. */
export default function AttendanceRequestScreen({ navigation }: Props) {
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState(nowHHmm());
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function submit() {
    setSubmitting(true);
    setResult(null);
    const response = await requestAttendance({ date, time, reason: reason.trim() });
    setSubmitting(false);
    setResult({
      success: response.success,
      message: response.success ? "Request submitted for approval." : response.message,
    });
    if (response.success) setTimeout(() => navigation.goBack(), 1000);
  }

  const valid = date.trim() && time.trim() && reason.trim();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={neutral.textFaint}
        testID="attendance-request-date"
      />

      <Text style={styles.label}>Time</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="HH:mm"
        placeholderTextColor={neutral.textFaint}
        testID="attendance-request-time"
      />

      <Text style={styles.label}>Reason</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={reason}
        onChangeText={setReason}
        placeholder="Explain the missed or incorrect punch…"
        placeholderTextColor={neutral.textFaint}
        multiline
        numberOfLines={4}
        testID="attendance-request-reason"
      />

      {result ? (
        <Text style={[styles.result, result.success ? styles.resultSuccess : styles.resultError]}>{result.message}</Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.submitButton, (!valid || submitting) && styles.submitButtonDisabled, pressed && styles.pressed]}
        onPress={submit}
        disabled={!valid || submitting}
        testID="attendance-request-submit"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <HugeiconsIcon icon={SentIcon} size={16} color="#fff" strokeWidth={1.8} />
            <Text style={styles.submitButtonText}>Submit request</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },
  label: { fontSize: 12, color: neutral.textMuted, textTransform: "uppercase", fontWeight: "600", marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: neutral.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: neutral.text, backgroundColor: neutral.card,
  },
  textarea: { minHeight: 90, textAlignVertical: "top" },
  result: { textAlign: "center", fontSize: 13, marginTop: 16 },
  resultSuccess: { color: semantic.success.fg },
  resultError: { color: semantic.destructive.fg },
  pressed: { opacity: 0.85 },
  submitButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: accent.solid, borderRadius: 12, paddingVertical: 14, marginTop: 20, marginBottom: 40,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

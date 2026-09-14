import { useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { requestRosterChange } from "../api/Attendance/AttendanceAPI";
import { moduleColor, neutral, semantic } from "../theme";
import Card from "../components/Card";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Calendar03Icon, SentIcon } from "@hugeicons/core-free-icons";

const accent = moduleColor.attendance;

type Props = NativeStackScreenProps<RootStackParamList, "RequestRosterChange">;

function formatDateLabel(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

export default function RequestRosterChangeScreen({ route, navigation }: Props) {
  const { rosterDate } = route.params;
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function submit() {
    setSubmitting(true);
    setResult(null);
    const response = await requestRosterChange(rosterDate, note.trim());
    setSubmitting(false);
    setResult({
      success: response.success,
      message: response.success ? "Request submitted for approval." : response.message,
    });
    if (response.success) setTimeout(() => navigation.goBack(), 1000);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.dateCard}>
        <View style={[styles.dateIconBadge, { backgroundColor: accent.bg }]}>
          <HugeiconsIcon icon={Calendar03Icon} size={18} color={accent.fg} strokeWidth={1.8} />
        </View>
        <Text style={styles.dateText}>{formatDateLabel(rosterDate)}</Text>
      </Card>

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="Explain why you'd like this roster changed…"
        placeholderTextColor={neutral.textFaint}
        multiline
        numberOfLines={4}
        testID="roster-change-note"
      />

      {result ? (
        <Text style={[styles.result, result.success ? styles.resultSuccess : styles.resultError]}>{result.message}</Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.submitButton, (!note.trim() || submitting) && styles.submitButtonDisabled, pressed && styles.pressed]}
        onPress={submit}
        disabled={!note.trim() || submitting}
        testID="roster-change-submit"
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <HugeiconsIcon icon={SentIcon} size={16} color="#fff" strokeWidth={1.8} />
            <Text style={styles.submitButtonText}>Add request</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  dateCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  dateIconBadge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  dateText: { fontSize: 15, fontWeight: "700", color: neutral.text, flex: 1 },
  label: { fontSize: 12, color: neutral.textMuted, textTransform: "uppercase", fontWeight: "600", marginTop: 6 },
  input: {
    borderWidth: 1, borderColor: neutral.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: neutral.text, textAlignVertical: "top", minHeight: 96, backgroundColor: neutral.card,
  },
  result: { textAlign: "center", fontSize: 13, marginTop: 4 },
  resultSuccess: { color: semantic.success.fg },
  resultError: { color: semantic.destructive.fg },
  pressed: { opacity: 0.85 },
  submitButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: accent.solid, borderRadius: 12, paddingVertical: 14, marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

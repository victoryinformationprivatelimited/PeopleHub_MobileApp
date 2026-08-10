import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { RosterReturn, AttendanceSummaryReturn } from "../type/attendance";
import { getMyRoster, getMyAttendanceSummary } from "../api/Attendance/AttendanceAPI";

type Props = NativeStackScreenProps<RootStackParamList, "AttendanceHome">;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendanceHomeScreen({ navigation }: Props) {
  const [roster, setRoster] = useState<RosterReturn | null>(null);
  const [summary, setSummary] = useState<AttendanceSummaryReturn | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    Promise.all([
      getMyRoster(todayIso()),
      getMyAttendanceSummary(now.getFullYear(), now.getMonth() + 1),
    ]).then(([rosterRes, summaryRes]) => {
      if (rosterRes.success) setRoster(rosterRes.data);
      if (summaryRes.success) setSummary(summaryRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's roster</Text>
        {roster?.workPatternName ? (
          <>
            <Text style={styles.line}>{roster.workPatternName}</Text>
            <Text style={styles.lineMuted}>{roster.rosterStartTime} – {roster.rosterEndTime}</Text>
            <Text style={styles.lineMuted}>{roster.unitEntityName}</Text>
          </>
        ) : (
          <Text style={styles.lineMuted}>No roster assigned for today.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>This month</Text>
        <View style={styles.summaryRow}>
          <SummaryStat label="Present" value={summary?.presentDays} />
          <SummaryStat label="Absent" value={summary?.absentDays} />
          <SummaryStat label="Late" value={summary?.lateDays} />
        </View>
      </View>

      <Pressable style={styles.button} onPress={() => navigation.navigate("MarkAttendance")} testID="mark-attendance-button">
        <Text style={styles.buttonText}>Mark attendance</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("PendingApprovals")} testID="approvals-button">
        <Text style={styles.secondaryButtonText}>Pending approvals (manager)</Text>
      </Pressable>
    </ScrollView>
  );
}

function SummaryStat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value ?? "—"}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  card: { backgroundColor: "#f8f9fa", borderRadius: 12, padding: 16 },
  cardTitle: { fontSize: 13, color: "#666", marginBottom: 8, textTransform: "uppercase" },
  line: { fontSize: 16, fontWeight: "600", color: "#111" },
  lineMuted: { fontSize: 14, color: "#555", marginTop: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700", color: "#111" },
  statLabel: { fontSize: 12, color: "#666" },
  button: { backgroundColor: "#0d6efd", borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  secondaryButton: { backgroundColor: "#f1f3f5", borderRadius: 8, paddingVertical: 14, alignItems: "center" },
  secondaryButtonText: { color: "#333", fontWeight: "600" },
});

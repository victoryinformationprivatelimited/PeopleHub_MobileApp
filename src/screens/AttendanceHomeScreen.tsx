import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { RosterReturn, AttendanceSummaryReturn } from "../type/attendance";
import { getMyRoster, getMyAttendanceSummary } from "../api/Attendance/AttendanceAPI";
import { moduleColor, chart } from "../theme";
import PieChart from "../components/PieChart";
import Card from "../components/Card";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { CheckmarkCircle02Icon, Calendar03Icon, ClipboardCheckIcon } from "@hugeicons/core-free-icons";

const accent = moduleColor.attendance;

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

  if (loading) return <SkeletonScreen />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
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
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>This month</Text>
        {summary ? (
          <PieChart
            segments={[
              { label: "Present", value: summary.presentDays, color: chart.present },
              { label: "Absent", value: summary.absentDays, color: chart.absent },
              { label: "Leaves", value: summary.leaveDays, color: chart.leaves },
            ]}
          />
        ) : null}
        <View style={styles.summaryRow}>
          <SummaryStat label="Late" value={summary?.lateDays} />
          <SummaryStat label="Holidays" value={summary?.holidayDays} />
          <SummaryStat label="Weekends" value={summary?.weekendDays} />
        </View>
      </Card>

      <ActionRow
        icon={CheckmarkCircle02Icon}
        label="Mark attendance"
        onPress={() => navigation.navigate("MarkAttendance")}
        testID="mark-attendance-button"
      />
      <ActionRow
        icon={Calendar03Icon}
        label="Leave"
        onPress={() => navigation.navigate("LeaveHome")}
        testID="leave-home-button"
      />
      <ActionRow
        icon={ClipboardCheckIcon}
        label="Pending approvals (manager)"
        onPress={() => navigation.navigate("PendingApprovals")}
        testID="approvals-button"
        variant="secondary"
      />
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

function ActionRow({
  icon,
  label,
  onPress,
  testID,
  variant = "primary",
}: {
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
  testID: string;
  variant?: "primary" | "secondary";
}) {
  const isPrimary = variant === "primary";
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPress}
      testID={testID}
    >
      <View style={[styles.buttonIconBadge, isPrimary ? styles.buttonIconBadgeOnPrimary : styles.buttonIconBadgeOnSecondary]}>
        <HugeiconsIcon icon={icon} size={17} color={isPrimary ? "#fff" : accent.fg} strokeWidth={1.8} />
      </View>
      <Text style={[styles.buttonText, isPrimary ? styles.buttonTextOnPrimary : styles.buttonTextOnSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 28, gap: 14 },
  card: { padding: 16 },
  cardTitle: { fontSize: 13, color: accent.fg, marginBottom: 12, textTransform: "uppercase", fontWeight: "700" },
  line: { fontSize: 16, fontWeight: "600", color: "#111" },
  lineMuted: { fontSize: 14, color: "#555", marginTop: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700", color: accent.fg },
  statLabel: { fontSize: 12, color: "#666" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  buttonPrimary: {
    backgroundColor: accent.solid,
    shadowColor: accent.solid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonSecondary: { backgroundColor: accent.bg, borderWidth: 1, borderColor: "rgba(31,35,40,0.08)" },
  buttonPressed: { opacity: 0.85 },
  buttonIconBadge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  buttonIconBadgeOnPrimary: { backgroundColor: "rgba(255,255,255,0.22)" },
  buttonIconBadgeOnSecondary: { backgroundColor: "#ffffff" },
  buttonText: { fontWeight: "600", fontSize: 15 },
  buttonTextOnPrimary: { color: "#fff" },
  buttonTextOnSecondary: { color: accent.fg },
});

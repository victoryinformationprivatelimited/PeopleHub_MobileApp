import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { AttendanceRecordReturn } from "../type/attendance";
import { getMyAttendance } from "../api/Attendance/AttendanceAPI";
import { moduleColor, neutral, attendanceStatusStyle } from "../theme";
import Card from "../components/Card";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft01Icon, ArrowRight01Icon, Clock01Icon } from "@hugeicons/core-free-icons";

const accent = moduleColor.attendance;

type Props = NativeStackScreenProps<RootStackParamList, "MyAttendance">;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function MyAttendanceScreen({}: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [records, setRecords] = useState<AttendanceRecordReturn[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthStart = `${year}-${pad(month)}-01`;
  const monthEnd = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getMyAttendance(monthStart, monthEnd).then((res) => {
      if (cancelled) return;
      if (res.success) setRecords(res.data ?? []);
      else setError(res.message);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [monthStart, monthEnd]);

  function goPrevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); } else { setMonth((m) => m - 1); }
  }
  function goNextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); } else { setMonth((m) => m + 1); }
  }

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  // Newest first, matching how you'd scan back through the month.
  const sorted = useMemo(() => [...(records ?? [])].sort((a, b) => b.date.localeCompare(a.date)), [records]);

  if (loading && records == null) return <SkeletonScreen />;

  return (
    <FlatList
      contentContainerStyle={styles.container}
      style={{ backgroundColor: neutral.background }}
      data={sorted}
      keyExtractor={(item) => item.date}
      ListHeaderComponent={
        <Card style={styles.monthNavCard}>
          <Pressable style={styles.navButton} onPress={goPrevMonth} testID="attendance-prev-month">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color={accent.fg} strokeWidth={2} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable style={styles.navButton} onPress={goNextMonth} testID="attendance-next-month">
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={accent.fg} strokeWidth={2} />
          </Pressable>
        </Card>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {error ? `Couldn't load: ${error}` : "No attendance records for this month."}
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const style = attendanceStatusStyle[item.status] ?? { bg: neutral.background, fg: neutral.textMuted };
        return (
          <Card style={styles.recordCard}>
            <View style={styles.recordHeader}>
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                <Text style={[styles.statusBadgeText, { color: style.fg }]}>{item.status}</Text>
              </View>
            </View>
            {item.rosterStartTime ? (
              <Text style={styles.rosterText}>Roster: {item.rosterStartTime} – {item.rosterEndTime}</Text>
            ) : null}
            {(item.actualOnTime || item.actualOffTime) ? (
              <View style={styles.timesRow}>
                <HugeiconsIcon icon={Clock01Icon} size={13} color={neutral.textMuted} strokeWidth={1.8} />
                <Text style={styles.timesText}>
                  {item.actualOnTime ?? "—"} → {item.actualOffTime ?? "—"}
                  {item.workedHours != null ? ` · ${item.workedHours.toFixed(1)}h worked` : ""}
                </Text>
              </View>
            ) : null}
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, gap: 10 },
  monthNavCard: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, padding: 12, marginBottom: 4 },
  navButton: {
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: neutral.background, borderWidth: 1, borderColor: neutral.border,
  },
  monthLabel: { fontSize: 14, fontWeight: "700", color: neutral.text, minWidth: 130, textAlign: "center" },
  empty: {
    alignItems: "center", backgroundColor: "#fff", borderRadius: 14, borderWidth: 1.5,
    borderColor: neutral.border, borderStyle: "dashed", paddingVertical: 32, marginTop: 12,
  },
  emptyText: { color: neutral.textMuted, fontSize: 13.5, fontWeight: "500" },
  recordCard: { padding: 14, gap: 6 },
  recordHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  dateText: { fontSize: 14.5, fontWeight: "700", color: neutral.text },
  statusBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11.5, fontWeight: "700" },
  rosterText: { fontSize: 12.5, color: neutral.textMuted },
  timesRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  timesText: { fontSize: 12.5, color: neutral.textMuted, fontWeight: "500" },
});

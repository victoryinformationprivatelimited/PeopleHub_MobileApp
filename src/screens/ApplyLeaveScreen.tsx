import { useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { LeaveEntitlementReturn, AvailableShiftReturn, CoveringPersonReturn, ApplyLeaveReq } from "../type/leave";
import { getMyLeaveEntitlements, getAvailableShifts, getCoveringPersons, applyLeave } from "../api/Leave/LeaveAPI";
import { moduleColor, semantic } from "../theme";

const accent = moduleColor.leave;

type Props = NativeStackScreenProps<RootStackParamList, "ApplyLeave">;

const DURATION_TYPES: ApplyLeaveReq["durationType"][] = ["FullDay", "HalfDay", "ShortLeave", "Hourly"];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ApplyLeaveScreen({ navigation }: Props) {
  const [entitlements, setEntitlements] = useState<LeaveEntitlementReturn[]>([]);
  const [shifts, setShifts] = useState<AvailableShiftReturn[]>([]);
  const [coveringPersons, setCoveringPersons] = useState<CoveringPersonReturn[]>([]);
  const [loading, setLoading] = useState(true);

  const [fromDate, setFromDate] = useState(todayIso());
  const [toDate, setToDate] = useState(todayIso());
  const [leaveTypeId, setLeaveTypeId] = useState<number | null>(null);
  const [durationType, setDurationType] = useState<ApplyLeaveReq["durationType"]>("FullDay");
  const [hours, setHours] = useState("");
  const [shiftId, setShiftId] = useState<number | null>(null);
  const [coveringEmployeeId, setCoveringEmployeeId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    getMyLeaveEntitlements(new Date().getFullYear()).then((res) => {
      if (res.success && res.data) setEntitlements(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!fromDate) return;
    setShiftId(null);
    setCoveringEmployeeId(null);
    getAvailableShifts(fromDate).then((res) => { if (res.success && res.data) setShifts(res.data); });
    getCoveringPersons(fromDate).then((res) => { if (res.success && res.data) setCoveringPersons(res.data); });
  }, [fromDate]);

  async function submit() {
    if (!leaveTypeId || !shiftId || !coveringEmployeeId) {
      setResult("Select a leave type, shift, and covering person.");
      return;
    }
    setSubmitting(true);
    setResult(null);
    const response = await applyLeave({
      fromDate,
      toDate,
      shiftId,
      leaveTypeId,
      durationType,
      hours: durationType === "Hourly" ? Number(hours) || undefined : undefined,
      coveringEmployeeId,
      reason: reason || undefined,
    });
    setSubmitting(false);
    setResult(response.success ? "Submitted for approval." : response.message);
    if (response.success) setTimeout(() => navigation.goBack(), 1000);
  }

  if (loading) return <SkeletonScreen />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>From date</Text>
      <TextInput style={styles.input} value={fromDate} onChangeText={setFromDate} placeholder="YYYY-MM-DD" />

      <Text style={styles.label}>To date</Text>
      <TextInput style={styles.input} value={toDate} onChangeText={setToDate} placeholder="YYYY-MM-DD" />

      <Text style={styles.label}>Leave type</Text>
      <ChipRow
        items={entitlements.map((e) => ({ id: e.leaveTypeId, label: `${e.leaveTypeName} (${e.balanceDays} left)` }))}
        selectedId={leaveTypeId}
        onSelect={setLeaveTypeId}
      />

      <Text style={styles.label}>Duration</Text>
      <ChipRow
        items={DURATION_TYPES.map((d) => ({ id: d, label: d }))}
        selectedId={durationType}
        onSelect={(id) => setDurationType(id as ApplyLeaveReq["durationType"])}
      />

      {durationType === "Hourly" ? (
        <>
          <Text style={styles.label}>Hours</Text>
          <TextInput style={styles.input} value={hours} onChangeText={setHours} keyboardType="numeric" placeholder="e.g. 2" />
        </>
      ) : null}

      <Text style={styles.label}>Shift</Text>
      <ChipRow
        items={shifts.map((s) => ({ id: s.shiftId, label: `${s.shiftName} (${s.startTime}–${s.endTime})` }))}
        selectedId={shiftId}
        onSelect={setShiftId}
        empty="No shifts available for this date."
      />

      <Text style={styles.label}>Covering person</Text>
      <ChipRow
        items={coveringPersons.map((p) => ({ id: p.employeeId, label: p.employeeName }))}
        selectedId={coveringEmployeeId}
        onSelect={setCoveringEmployeeId}
        empty="No covering persons available."
      />

      <Text style={styles.label}>Reason (optional)</Text>
      <TextInput style={styles.input} value={reason} onChangeText={setReason} placeholder="Reason" multiline />

      {result ? <Text style={styles.result}>{result}</Text> : null}

      <Pressable style={styles.submitButton} onPress={submit} disabled={submitting} testID="apply-leave-submit">
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit for approval</Text>}
      </Pressable>
    </ScrollView>
  );
}

function ChipRow<T extends string | number>({
  items, selectedId, onSelect, empty,
}: {
  items: { id: T; label: string }[];
  selectedId: T | null;
  onSelect: (id: T) => void;
  empty?: string;
}) {
  if (items.length === 0) return <Text style={styles.emptyChips}>{empty ?? "No options available."}</Text>;
  return (
    <View style={styles.chipRow}>
      {items.map((item) => (
        <Pressable
          key={String(item.id)}
          style={[styles.chip, selectedId === item.id && styles.chipSelected]}
          onPress={() => onSelect(item.id)}
        >
          <Text style={[styles.chipText, selectedId === item.id && styles.chipTextSelected]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4 },
  label: { fontSize: 12, color: "#666", textTransform: "uppercase", marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#f1f3f5", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipSelected: { backgroundColor: accent.solid },
  chipText: { color: "#333", fontSize: 13 },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  emptyChips: { color: "#999", fontSize: 13, fontStyle: "italic" },
  result: { textAlign: "center", color: "#333", marginTop: 16 },
  submitButton: { backgroundColor: semantic.success.solid, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 20, marginBottom: 40 },
  submitButtonText: { color: "#fff", fontWeight: "600" },
});

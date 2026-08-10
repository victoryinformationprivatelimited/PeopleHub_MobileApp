import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { neutral, chart } from "../theme";
import GradientHeader from "../components/GradientHeader";
import StatTile from "../components/StatTile";
import PieChart from "../components/PieChart";
import { getSection } from "../api/Profile/ProfileAPI";
import { getMyAttendanceSummary } from "../api/Attendance/AttendanceAPI";
import { getMyLeaveEntitlements } from "../api/Leave/LeaveAPI";
import { getMyPayPeriods, getMyPayslip } from "../api/Payroll/PayrollAPI";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

interface DashboardData {
  fullName: string;
  employeeNumber: string;
  attendanceSummary: { presentDays: number; absentDays: number; leaveDays: number } | null;
  leaveBalance: number | null;
  netPay: { amount: number; payPeriodId: number; label: string } | null;
}

function fieldValue(fields: { label: string; value: string | null }[], label: string): string | null {
  return fields.find((f) => f.label === label)?.value ?? null;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default function HomeScreen({ navigation }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();

    Promise.all([
      getSection("basic"),
      getMyAttendanceSummary(now.getFullYear(), now.getMonth() + 1),
      getMyLeaveEntitlements(now.getFullYear()),
      getMyPayPeriods(),
    ]).then(async ([basicRes, attendanceRes, leaveRes, payPeriodsRes]) => {
      let fullName = "";
      let employeeNumber = "";
      const basicPayload = basicRes.success ? basicRes.data : null;
      if (basicPayload?.type === "fields") {
        const fields = basicPayload.fields;
        const first = fieldValue(fields, "First Name") ?? "";
        const last = fieldValue(fields, "Last Name") ?? "";
        fullName = [first, last].filter(Boolean).join(" ");
        employeeNumber = fieldValue(fields, "Employee Number") ?? "";
      }

      const attendanceSummary = attendanceRes.success && attendanceRes.data
        ? {
            presentDays: attendanceRes.data.presentDays,
            absentDays: attendanceRes.data.absentDays,
            leaveDays: attendanceRes.data.leaveDays,
          }
        : null;

      const leaveBalance = leaveRes.success && leaveRes.data
        ? leaveRes.data.reduce((sum, e) => sum + e.balanceDays, 0)
        : null;

      let netPay: DashboardData["netPay"] = null;
      if (payPeriodsRes.success && payPeriodsRes.data && payPeriodsRes.data.length > 0) {
        const currentPeriod = payPeriodsRes.data[payPeriodsRes.data.length - 1];
        const payslipRes = await getMyPayslip(currentPeriod.payPeriodId);
        if (payslipRes.success && payslipRes.data?.payrollEngineConfigured) {
          netPay = { amount: payslipRes.data.netPay, payPeriodId: currentPeriod.payPeriodId, label: currentPeriod.label };
        }
      }

      setData({ fullName, employeeNumber, attendanceSummary, leaveBalance, netPay });
      setLoading(false);
    });
  }, []);

  if (loading || !data) return <ActivityIndicator style={{ marginTop: 60 }} />;

  const attendanceRate = data.attendanceSummary
    ? Math.round(
        (data.attendanceSummary.presentDays /
          Math.max(data.attendanceSummary.presentDays + data.attendanceSummary.absentDays, 1)) *
          100,
      )
    : null;

  return (
    <ScrollView style={{ backgroundColor: neutral.background }}>
      <GradientHeader>
        <View style={styles.heroRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialsOf(data.fullName) || "?"}</Text>
          </View>
          <View>
            <Text style={styles.heroName}>{data.fullName || "Employee"}</Text>
            {data.employeeNumber ? <Text style={styles.heroMeta}>{data.employeeNumber}</Text> : null}
          </View>
        </View>
      </GradientHeader>

      <View style={styles.statsRow}>
        <StatTile
          symbol="✓"
          value={attendanceRate != null ? `${attendanceRate}%` : "—"}
          label="Attendance"
          onPress={() => navigation.getParent()?.navigate("AttendanceTab" as never)}
          testID="stat-attendance"
        />
        <StatTile
          symbol="$"
          value={data.netPay ? `$${data.netPay.amount.toFixed(0)}` : "N/A"}
          label="Net Pay"
          onPress={() => navigation.getParent()?.navigate("PayrollTab" as never)}
          testID="stat-netpay"
        />
        <StatTile
          symbol="L"
          value={data.leaveBalance != null ? `${data.leaveBalance}` : "—"}
          label="Leave Days"
          onPress={() => navigation.getParent()?.navigate("AttendanceTab" as never)}
          testID="stat-leave"
        />
      </View>

      {data.attendanceSummary ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Attendance This Month</Text>
          <PieChart
            segments={[
              { label: "Present", value: data.attendanceSummary.presentDays, color: chart.present },
              { label: "Absent", value: data.attendanceSummary.absentDays, color: chart.absent },
              { label: "Leaves", value: data.attendanceSummary.leaveDays, color: chart.leaves },
            ]}
          />
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton label="Mark Attendance" onPress={() => navigation.navigate("MarkAttendance")} testID="qa-mark-attendance" />
          <ActionButton label="Apply for Leave" onPress={() => navigation.navigate("ApplyLeave")} testID="qa-apply-leave" />
          <ActionButton label="Pending Approvals" onPress={() => navigation.navigate("PendingApprovals")} testID="qa-approvals" />
          {data.netPay ? (
            <ActionButton
              label="View Payslip"
              onPress={() => navigation.navigate("Payslip", { payPeriodId: data.netPay!.payPeriodId, label: data.netPay!.label })}
              testID="qa-payslip"
            />
          ) : null}
          <ActionButton label="Request Reimbursement" onPress={() => navigation.navigate("RequestReimbursement")} testID="qa-reimbursement" />
          <ActionButton label="Company Hierarchy" onPress={() => navigation.navigate("CompanyHierarchy")} testID="qa-hierarchy" />
        </View>
      </View>
    </ScrollView>
  );
}

function ActionButton({ label, onPress, testID }: { label: string; onPress: () => void; testID: string }) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress} testID={testID}>
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 2, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 20 },
  heroName: { color: "#fff", fontWeight: "700", fontSize: 18 },
  heroMeta: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: -20 },
  card: { backgroundColor: neutral.card, borderRadius: 14, padding: 16, marginHorizontal: 16, marginTop: 16, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: neutral.text, marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionButton: { backgroundColor: "#e0f7fa", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, minWidth: "45%", flexGrow: 1, alignItems: "center" },
  actionButtonText: { color: "#0097a7", fontWeight: "600", fontSize: 13, textAlign: "center" },
});

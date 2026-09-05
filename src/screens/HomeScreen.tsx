import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import {
  CheckmarkCircle02Icon,
  DollarCircleIcon,
  Calendar03Icon,
  CalendarAdd02Icon,
  ClipboardCheckIcon,
  ReceiptDollarIcon,
  Wallet01Icon,
  Structure02Icon,
} from "@hugeicons/core-free-icons";
import type { RootStackParamList } from "../navigation/types";
import { neutral, brand, chart } from "../theme";
import GradientHeader from "../components/GradientHeader";
import StatTile from "../components/StatTile";
import Card from "../components/Card";
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

/** Placeholder dashboard numbers shown until a real backend/tenant is wired up, so the
 * screen is demoable instead of showing "N/A"/"—" everywhere. Swap out once real data flows. */
const DUMMY_DATA: DashboardData = {
  fullName: "John Doe",
  employeeNumber: "E010236",
  attendanceSummary: { presentDays: 18, absentDays: 2, leaveDays: 1 },
  leaveBalance: 14,
  netPay: { amount: 3250, payPeriodId: 1, label: "This month" },
};

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

      setData({
        fullName: fullName || DUMMY_DATA.fullName,
        employeeNumber: employeeNumber || DUMMY_DATA.employeeNumber,
        attendanceSummary: attendanceSummary ?? DUMMY_DATA.attendanceSummary,
        leaveBalance: leaveBalance ?? DUMMY_DATA.leaveBalance,
        netPay: netPay ?? DUMMY_DATA.netPay,
      });
      setLoading(false);
    });
  }, []);

  if (loading || !data) return <SkeletonScreen />;

  const attendanceRate = data.attendanceSummary
    ? Math.round(
        (data.attendanceSummary.presentDays /
          Math.max(data.attendanceSummary.presentDays + data.attendanceSummary.absentDays, 1)) *
          100,
      )
    : null;

  return (
    <ScrollView style={{ backgroundColor: neutral.background }} contentContainerStyle={styles.scrollContent}>
      <GradientHeader style={styles.hero}>
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
          icon={CheckmarkCircle02Icon}
          value={attendanceRate != null ? `${attendanceRate}%` : "—"}
          label="Attendance"
          onPress={() => navigation.getParent()?.navigate("AttendanceTab" as never)}
          testID="stat-attendance"
        />
        <StatTile
          icon={DollarCircleIcon}
          value={data.netPay ? `$${data.netPay.amount.toFixed(0)}` : "N/A"}
          label="Net Pay"
          onPress={() => navigation.getParent()?.navigate("PayrollTab" as never)}
          testID="stat-netpay"
        />
        <StatTile
          icon={Calendar03Icon}
          value={data.leaveBalance != null ? `${data.leaveBalance}` : "—"}
          label="Leave Days"
          onPress={() => (navigation.getParent() as any)?.navigate("AttendanceTab", { screen: "LeaveHome" })}
          testID="stat-leave"
        />
      </View>

      {data.attendanceSummary ? (
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Attendance This Month</Text>
          <PieChart
            segments={[
              { label: "Present", value: data.attendanceSummary.presentDays, color: chart.present },
              { label: "Absent", value: data.attendanceSummary.absentDays, color: chart.absent },
              { label: "Leaves", value: data.attendanceSummary.leaveDays, color: chart.leaves },
            ]}
          />
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            icon={CheckmarkCircle02Icon}
            label="Mark Attendance"
            onPress={() => navigation.navigate("MarkAttendance")}
            testID="qa-mark-attendance"
          />
          <ActionButton
            icon={Calendar03Icon}
            label="Leave"
            onPress={() => (navigation.getParent() as any)?.navigate("AttendanceTab", { screen: "LeaveHome" })}
            testID="qa-leave"
          />
          <ActionButton
            icon={CalendarAdd02Icon}
            label="Apply for Leave"
            onPress={() => navigation.navigate("ApplyLeave")}
            testID="qa-apply-leave"
          />
          <ActionButton
            icon={ClipboardCheckIcon}
            label="Pending Approvals"
            onPress={() => navigation.navigate("PendingApprovals")}
            testID="qa-approvals"
          />
          {data.netPay ? (
            <ActionButton
              icon={ReceiptDollarIcon}
              label="View Payslip"
              onPress={() => navigation.navigate("Payslip", { payPeriodId: data.netPay!.payPeriodId, label: data.netPay!.label })}
              testID="qa-payslip"
            />
          ) : null}
          <ActionButton
            icon={Wallet01Icon}
            label="Request Reimbursement"
            onPress={() => navigation.navigate("RequestReimbursement")}
            testID="qa-reimbursement"
          />
          <ActionButton
            icon={Structure02Icon}
            label="Company Hierarchy"
            onPress={() => navigation.navigate("CompanyHierarchy")}
            testID="qa-hierarchy"
          />
        </View>
      </Card>
    </ScrollView>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: IconSvgElement;
  label: string;
  onPress: () => void;
  testID: string;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
      onPress={onPress}
      testID={testID}
    >
      <View style={styles.actionIconBadge}>
        <HugeiconsIcon icon={icon} size={19} color={brand.dark1} strokeWidth={1.8} />
      </View>
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
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
  hero: { paddingBottom: 36, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: -16 },
  card: { padding: 16, marginHorizontal: 16, marginTop: 16, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: neutral.text, marginBottom: 16 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(31,35,40,0.08)",
    paddingVertical: 16,
    paddingHorizontal: 12,
    minWidth: "45%",
    flexGrow: 1,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  actionButtonPressed: { opacity: 0.75, backgroundColor: "#f5f6f7" },
  actionIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#e6f2ee",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: { color: brand.dark1, fontWeight: "600", fontSize: 13, textAlign: "center" },
});

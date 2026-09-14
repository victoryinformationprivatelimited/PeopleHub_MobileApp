import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Image } from "react-native";
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
  Structure02Icon,
  ArrowRight02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import type { RootStackParamList } from "../navigation/types";
import type { RosterReturn } from "../type/attendance";
import { neutral, brand, semantic, chart } from "../theme";
import GradientHeader from "../components/GradientHeader";
import StatTile from "../components/StatTile";
import Card from "../components/Card";
import PieChart from "../components/PieChart";
import { getSection, getBasicInfoRaw } from "../api/Profile/ProfileAPI";
import { getMyAttendanceSummary, getMyPendingApprovals, getMyRoster } from "../api/Attendance/AttendanceAPI";
import { getMyLeaveEntitlements } from "../api/Leave/LeaveAPI";
import { getMyPayPeriods, getMyPayslip } from "../api/Payroll/PayrollAPI";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

interface DashboardData {
  fullName: string;
  employeeNumber: string;
  designation: string;
  entity: string;
  employeeImage: string | null;
  attendanceSummary: { presentDays: number; absentDays: number; leaveDays: number } | null;
  leaveBalance: number | null;
  netPay: { amount: number; payPeriodId: number; label: string } | null;
  pendingApprovalsCount: number;
  todayRoster: RosterReturn | null;
}

function fieldValue(fields: { label: string; value: string | null }[], label: string): string | null {
  return fields.find((f) => f.label === label)?.value ?? null;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

/** Placeholder dashboard numbers shown until a real backend/tenant is wired up, so the
 * screen is demoable instead of showing "N/A"/"—" everywhere. Swap out once real data flows. */
const DUMMY_DATA: DashboardData = {
  fullName: "John Doe",
  employeeNumber: "E010236",
  designation: "Software Engineer",
  entity: "Victory Information PVT LTD",
  employeeImage: null,
  attendanceSummary: { presentDays: 18, absentDays: 2, leaveDays: 1 },
  leaveBalance: 14,
  netPay: { amount: 3250, payPeriodId: 1, label: "This month" },
  pendingApprovalsCount: 0,
  todayRoster: null,
};

export default function HomeScreen({ navigation }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();

    Promise.all([
      getSection("basic"),
      getBasicInfoRaw(),
      getSection("employment"),
      getMyAttendanceSummary(now.getFullYear(), now.getMonth() + 1),
      getMyLeaveEntitlements(now.getFullYear()),
      getMyPayPeriods(),
      getMyPendingApprovals(),
      getMyRoster(todayIso()),
    ]).then(async ([basicRes, basicRawRes, employmentRes, attendanceRes, leaveRes, payPeriodsRes, approvalsRes, rosterRes]) => {
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

      const employeeImage = basicRawRes.success ? basicRawRes.data?.employeeImage ?? null : null;

      let designation = "";
      let entity = "";
      const employmentPayload = employmentRes.success ? employmentRes.data : null;
      if (employmentPayload?.type === "fields") {
        const fields = employmentPayload.fields;
        designation = fieldValue(fields, "Role") ?? "";
        entity = fieldValue(fields, "Entity") ?? "";
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
        designation: designation || DUMMY_DATA.designation,
        entity: entity || DUMMY_DATA.entity,
        employeeImage,
        attendanceSummary: attendanceSummary ?? DUMMY_DATA.attendanceSummary,
        leaveBalance: leaveBalance ?? DUMMY_DATA.leaveBalance,
        netPay: netPay ?? DUMMY_DATA.netPay,
        pendingApprovalsCount: approvalsRes.success ? approvalsRes.data?.length ?? 0 : 0,
        todayRoster: rosterRes.success ? rosterRes.data : null,
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
        <View style={styles.heroCentered}>
          <View style={styles.avatarLarge}>
            {data.employeeImage ? (
              <Image source={{ uri: data.employeeImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarLargeText}>{initialsOf(data.fullName) || "?"}</Text>
            )}
          </View>
          <Text style={styles.heroNameCentered}>{data.fullName || "Employee"}</Text>
          {data.employeeNumber ? <Text style={styles.heroMetaCentered}>{data.employeeNumber}</Text> : null}
          {data.designation || data.entity ? (
            <Text style={styles.heroMetaCentered}>{[data.designation, data.entity].filter(Boolean).join(" · ")}</Text>
          ) : null}
        </View>
      </GradientHeader>

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

      <Pressable
        style={({ pressed }) => [styles.markAttendanceCard, pressed && styles.pressed]}
        onPress={() => navigation.navigate("MarkAttendance")}
        testID="home-mark-attendance"
      >
        <View style={styles.markAttendanceIconBadge}>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} color="#fff" strokeWidth={1.8} />
        </View>
        <View style={styles.markAttendanceTextWrap}>
          <Text style={styles.markAttendanceTitle}>Mark today's attendance</Text>
          <Text style={styles.markAttendanceSubtitle}>Tap to check in for today</Text>
        </View>
        <HugeiconsIcon icon={ArrowRight02Icon} size={18} color="#fff" strokeWidth={2} />
      </Pressable>

      <View style={styles.statsRow}>
        <StatTile
          icon={CheckmarkCircle02Icon}
          value={attendanceRate != null ? `${attendanceRate}%` : "—"}
          label="Attendance"
          tint={{ bg: semantic.success.bg, fg: semantic.success.fg }}
          onPress={() => navigation.getParent()?.navigate("AttendanceTab" as never)}
          testID="stat-attendance"
        />
        <StatTile
          icon={DollarCircleIcon}
          value={data.netPay ? `$${data.netPay.amount.toFixed(0)}` : "N/A"}
          label="Net Pay"
          tint={{ bg: semantic.info.bg, fg: semantic.info.fg }}
          onPress={() => navigation.getParent()?.navigate("PayrollTab" as never)}
          testID="stat-netpay"
        />
        <StatTile
          icon={Calendar03Icon}
          value={data.leaveBalance != null ? `${data.leaveBalance}` : "—"}
          label="Leave Days"
          tint={{ bg: "#e6f2ee", fg: brand.dark1 }}
          onPress={() => navigation.getParent()?.navigate("LeaveTab" as never)}
          testID="stat-leave"
        />
      </View>

      {data.pendingApprovalsCount > 0 ? (
        <Pressable
          style={({ pressed }) => [styles.approvalsCard, pressed && styles.pressed]}
          onPress={() => navigation.navigate("PendingApprovals")}
          testID="home-pending-approvals"
        >
          <View style={[styles.approvalsIconBadge, { backgroundColor: semantic.warning.bg }]}>
            <HugeiconsIcon icon={ClipboardCheckIcon} size={20} color={semantic.warning.fg} strokeWidth={1.8} />
          </View>
          <View style={styles.approvalsTextWrap}>
            <Text style={styles.approvalsCount}>{data.pendingApprovalsCount}</Text>
            <Text style={styles.approvalsLabel}>Pending approval{data.pendingApprovalsCount === 1 ? "" : "s"} awaiting you</Text>
          </View>
          <HugeiconsIcon icon={ArrowRight02Icon} size={16} color={neutral.textFaint} strokeWidth={2} />
        </Pressable>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <ActionButton
            icon={CalendarAdd02Icon}
            label="Apply for Leave"
            onPress={() => navigation.navigate("ApplyLeave")}
            testID="qa-apply-leave"
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
            icon={Structure02Icon}
            label="Company Hierarchy"
            onPress={() => navigation.navigate("CompanyHierarchy")}
            testID="qa-hierarchy"
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Today's Schedule</Text>
        {data.todayRoster?.workPatternName ? (
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleIconBadge}>
              <HugeiconsIcon icon={Clock01Icon} size={17} color={brand.dark1} strokeWidth={1.8} />
            </View>
            <View style={styles.scheduleTextWrap}>
              <Text style={styles.scheduleTitle}>{data.todayRoster.workPatternName}</Text>
              <Text style={styles.scheduleSubtitle}>
                {data.todayRoster.rosterStartTime} – {data.todayRoster.rosterEndTime}
                {data.todayRoster.unitEntityName ? ` · ${data.todayRoster.unitEntityName}` : ""}
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.scheduleEmpty}>No shift scheduled for today.</Text>
        )}
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
  pressed: { opacity: 0.85 },
  heroCentered: { alignItems: "center" },
  avatarLarge: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 3, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarLargeText: { color: "#fff", fontWeight: "700", fontSize: 32 },
  heroNameCentered: { color: "#fff", fontWeight: "700", fontSize: 20, textAlign: "center" },
  heroMetaCentered: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 3, textAlign: "center" },
  hero: { paddingBottom: 36, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  card: { padding: 16, marginHorizontal: 16, marginTop: 16, marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: neutral.text, marginBottom: 16 },
  markAttendanceCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: brand.solid, borderRadius: 16, padding: 16,
    marginHorizontal: 16, marginTop: 16,
    shadowColor: brand.solid, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 3,
  },
  markAttendanceIconBadge: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center", justifyContent: "center",
  },
  markAttendanceTextWrap: { flex: 1 },
  markAttendanceTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  markAttendanceSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 12.5, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 16 },
  approvalsCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    marginHorizontal: 16, marginTop: 16,
    borderWidth: 1, borderColor: neutral.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  approvalsIconBadge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  approvalsTextWrap: { flex: 1 },
  approvalsCount: { fontSize: 19, fontWeight: "700", color: neutral.text },
  approvalsLabel: { fontSize: 12.5, color: neutral.textMuted, marginTop: 1 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(31,35,40,0.08)",
    paddingVertical: 16,
    paddingHorizontal: 12,
    minWidth: "30%",
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
  actionButtonText: { color: brand.dark1, fontWeight: "600", fontSize: 12.5, textAlign: "center" },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  scheduleIconBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e6f2ee", alignItems: "center", justifyContent: "center" },
  scheduleTextWrap: { flex: 1 },
  scheduleTitle: { fontSize: 14.5, fontWeight: "700", color: neutral.text },
  scheduleSubtitle: { fontSize: 12.5, color: neutral.textMuted, marginTop: 2 },
  scheduleEmpty: { fontSize: 13, color: neutral.textMuted },
});

import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { PayPeriodReturn, PayslipReturn } from "../type/payroll";
import { getMyPayPeriods, getMyPayslip } from "../api/Payroll/PayrollAPI";
import { moduleColor } from "../theme";
import GradientHeader from "../components/GradientHeader";
import Card from "../components/Card";

const accent = moduleColor.payroll;

type Props = NativeStackScreenProps<RootStackParamList, "PayrollHome">;

/** Placeholder pay periods/payslip shown until a real backend/tenant is wired up. */
const DUMMY_PAY_PERIODS: PayPeriodReturn[] = [
  { payPeriodId: 1, label: "September 2026", startDate: "2026-09-01", endDate: "2026-09-30", payDate: "2026-10-05" },
  { payPeriodId: 2, label: "August 2026", startDate: "2026-08-01", endDate: "2026-08-31", payDate: "2026-09-05" },
  { payPeriodId: 3, label: "July 2026", startDate: "2026-07-01", endDate: "2026-07-31", payDate: "2026-08-05" },
];
const DUMMY_PAYSLIP: PayslipReturn = {
  payPeriodId: 1,
  payrollEngineConfigured: true,
  netPay: 3250,
  grossPay: 3800,
  totalDeductions: 550,
  employeeName: "John Doe",
  employeeNumber: "E010236",
  designation: null,
  payPeriodLabel: "September 2026",
  payDate: "2026-10-05",
  earnings: [{ label: "Basic Salary", amount: 3500 }, { label: "Allowances", amount: 300 }],
  deductions: [{ label: "Tax", amount: 400 }, { label: "EPF", amount: 150 }],
  note: null,
};

export default function PayrollHomeScreen({ navigation }: Props) {
  const [payPeriods, setPayPeriods] = useState<PayPeriodReturn[]>([]);
  const [latestPayslip, setLatestPayslip] = useState<PayslipReturn | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await getMyPayPeriods();
    if (result.success && result.data && result.data.length > 0) {
      setPayPeriods(result.data);
      const latest = result.data[result.data.length - 1];
      const payslipRes = await getMyPayslip(latest.payPeriodId);
      setLatestPayslip(payslipRes.success && payslipRes.data ? payslipRes.data : DUMMY_PAYSLIP);
    } else {
      setPayPeriods(DUMMY_PAY_PERIODS);
      setLatestPayslip(DUMMY_PAYSLIP);
    }
  }, []);

  useEffect(() => {
    load().then(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return <SkeletonScreen />;

  return (
    <FlatList
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={payPeriods}
      keyExtractor={(item) => String(item.payPeriodId)}
      ListHeaderComponent={
        <>
          {latestPayslip?.payrollEngineConfigured ? (
            <GradientHeader style={styles.hero}>
              <Text style={styles.heroLabel}>Current Month Net Pay</Text>
              <Text style={styles.heroAmount}>${latestPayslip.netPay.toFixed(2)}</Text>
              <View style={styles.heroRow}>
                <View>
                  <Text style={styles.heroSubLabel}>Gross Pay</Text>
                  <Text style={styles.heroSubValue}>${latestPayslip.grossPay.toFixed(2)}</Text>
                </View>
                <View>
                  <Text style={styles.heroSubLabel}>Total Deductions</Text>
                  <Text style={styles.heroSubValue}>${latestPayslip.totalDeductions.toFixed(2)}</Text>
                </View>
              </View>
            </GradientHeader>
          ) : null}
          <Pressable
            style={styles.reimbursementsButton}
            onPress={() => navigation.navigate("Reimbursements")}
            testID="reimbursements-button"
          >
            <Text style={styles.reimbursementsButtonText}>My reimbursements</Text>
          </Pressable>
          <Text style={styles.sectionTitle}>Pay periods</Text>
        </>
      }
      ListEmptyComponent={<Text style={styles.empty}>No pay periods found.</Text>}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate("Payslip", { payPeriodId: item.payPeriodId, label: item.label })}
          testID={`pay-period-${item.payPeriodId}`}
        >
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={styles.cardMeta}>{item.startDate} → {item.endDate}</Text>
            <Text style={styles.cardMeta}>Pay date: {item.payDate}</Text>
          </Card>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 28, gap: 10 },
  hero: { marginBottom: 16 },
  heroLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  heroAmount: { color: "#fff", fontSize: 32, fontWeight: "700", marginTop: 4 },
  heroRow: { flexDirection: "row", gap: 32, marginTop: 16 },
  heroSubLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  heroSubValue: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 2 },
  reimbursementsButton: { backgroundColor: accent.solid, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginBottom: 16, marginHorizontal: 16 },
  reimbursementsButtonText: { color: "#fff", fontWeight: "600" },
  sectionTitle: { fontSize: 13, color: "#666", textTransform: "uppercase", marginBottom: 12, marginHorizontal: 16 },
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { padding: 14, marginBottom: 10, marginHorizontal: 16 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: accent.fg },
  cardMeta: { fontSize: 13, color: "#666", marginTop: 2 },
});

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { PayslipReturn } from "../type/payroll";
import { getMyPayslip } from "../api/Payroll/PayrollAPI";
import { moduleColor, semantic } from "../theme";
import BarChart from "../components/BarChart";
import Card from "../components/Card";

const accent = moduleColor.payroll;

type Props = NativeStackScreenProps<RootStackParamList, "Payslip">;

export default function PayslipScreen({ route, navigation }: Props) {
  const { payPeriodId, label } = route.params;
  const [payslip, setPayslip] = useState<PayslipReturn | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigation.setOptions({ title: label });
    getMyPayslip(payPeriodId).then((result) => {
      if (result.success && result.data) setPayslip(result.data);
      else setError(result.message);
      setLoading(false);
    });
  }, [payPeriodId]);

  if (loading) return <SkeletonScreen />;
  if (error || !payslip) return <Text style={styles.error}>{error ?? "Payslip not found."}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.employeeName}>{payslip.employeeName}</Text>
        <Text style={styles.meta}>{payslip.employeeNumber}{payslip.designation ? ` · ${payslip.designation}` : ""}</Text>
        <Text style={styles.meta}>{payslip.payPeriodLabel} · Pay date {payslip.payDate}</Text>
      </View>

      {!payslip.payrollEngineConfigured ? (
        <View style={styles.notConfiguredCard}>
          <Text style={styles.notConfiguredText}>
            {payslip.note ?? "Payroll calculation is not configured for this organization yet."}
          </Text>
        </View>
      ) : (
        <>
          {payslip.earnings.length + payslip.deductions.length > 0 ? (
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Earnings Breakdown</Text>
              <BarChart
                data={[...payslip.earnings, ...payslip.deductions].map((item) => ({ label: item.label, value: item.amount }))}
              />
            </Card>
          ) : null}
          <LineItemSection title="Earnings" items={payslip.earnings} />
          <LineItemSection title="Deductions" items={payslip.deductions} />
          <Card style={styles.totalsCard}>
            <TotalRow label="Gross pay" value={payslip.grossPay} />
            <TotalRow label="Total deductions" value={payslip.totalDeductions} />
            <TotalRow label="Net pay" value={payslip.netPay} emphasize />
          </Card>
        </>
      )}
    </ScrollView>
  );
}

function LineItemSection({ title, items }: { title: string; items: { label: string; amount: number }[] }) {
  if (items.length === 0) return null;
  return (
    <Card style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.lineRow}>
          <Text style={styles.lineLabel}>{item.label}</Text>
          <Text style={styles.lineAmount}>{item.amount.toFixed(2)}</Text>
        </View>
      ))}
    </Card>
  );
}

function TotalRow({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <View style={styles.lineRow}>
      <Text style={[styles.lineLabel, emphasize && styles.emphasize]}>{label}</Text>
      <Text style={[styles.lineAmount, emphasize && styles.emphasize]}>{value.toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 28, gap: 12 },
  error: { textAlign: "center", color: "#b3261e", marginTop: 40, paddingHorizontal: 24 },
  header: { marginBottom: 8 },
  employeeName: { fontSize: 18, fontWeight: "700", color: "#111" },
  meta: { fontSize: 13, color: "#666", marginTop: 2 },
  notConfiguredCard: { backgroundColor: semantic.warning.bg, borderRadius: 12, padding: 16 },
  notConfiguredText: { color: semantic.warning.fg, fontSize: 14, lineHeight: 20 },
  card: { padding: 14 },
  cardTitle: { fontSize: 13, color: accent.fg, textTransform: "uppercase", marginBottom: 12, fontWeight: "700" },
  totalsCard: { padding: 14, marginTop: 4 },
  lineRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  lineLabel: { fontSize: 14, color: "#333" },
  lineAmount: { fontSize: 14, color: "#111", fontWeight: "600" },
  emphasize: { fontSize: 16, fontWeight: "700" },
});

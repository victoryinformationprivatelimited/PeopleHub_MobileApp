import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { PayPeriodReturn, PayslipReturn } from "../type/payroll";
import { getMyPayPeriods, getMyPayslip } from "../api/Payroll/PayrollAPI";
import { moduleColor } from "../theme";
import GradientHeader from "../components/GradientHeader";

const accent = moduleColor.payroll;

type Props = NativeStackScreenProps<RootStackParamList, "PayrollHome">;

export default function PayrollHomeScreen({ navigation }: Props) {
  const [payPeriods, setPayPeriods] = useState<PayPeriodReturn[]>([]);
  const [latestPayslip, setLatestPayslip] = useState<PayslipReturn | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await getMyPayPeriods();
    if (result.success && result.data) {
      setPayPeriods(result.data);
      const latest = result.data[result.data.length - 1];
      if (latest) {
        const payslipRes = await getMyPayslip(latest.payPeriodId);
        if (payslipRes.success && payslipRes.data) setLatestPayslip(payslipRes.data);
      }
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

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

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
          style={styles.card}
          onPress={() => navigation.navigate("Payslip", { payPeriodId: item.payPeriodId, label: item.label })}
          testID={`pay-period-${item.payPeriodId}`}
        >
          <Text style={styles.cardTitle}>{item.label}</Text>
          <Text style={styles.cardMeta}>{item.startDate} → {item.endDate}</Text>
          <Text style={styles.cardMeta}>Pay date: {item.payDate}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 16, gap: 10 },
  hero: { marginBottom: 16 },
  heroLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  heroAmount: { color: "#fff", fontSize: 32, fontWeight: "700", marginTop: 4 },
  heroRow: { flexDirection: "row", gap: 32, marginTop: 16 },
  heroSubLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  heroSubValue: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 2 },
  reimbursementsButton: { backgroundColor: accent.solid, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginBottom: 16, marginHorizontal: 16 },
  reimbursementsButtonText: { color: "#fff", fontWeight: "600" },
  sectionTitle: { fontSize: 13, color: "#666", textTransform: "uppercase", marginBottom: 8, marginHorizontal: 16 },
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { backgroundColor: accent.bg, borderRadius: 12, padding: 14, marginBottom: 10, marginHorizontal: 16 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: accent.fg },
  cardMeta: { fontSize: 13, color: "#666", marginTop: 2 },
});

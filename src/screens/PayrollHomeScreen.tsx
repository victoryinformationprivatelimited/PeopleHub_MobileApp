import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { PayPeriodReturn } from "../type/payroll";
import { getMyPayPeriods } from "../api/Payroll/PayrollAPI";
import { moduleColor } from "../theme";

const accent = moduleColor.payroll;

type Props = NativeStackScreenProps<RootStackParamList, "PayrollHome">;

export default function PayrollHomeScreen({ navigation }: Props) {
  const [payPeriods, setPayPeriods] = useState<PayPeriodReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await getMyPayPeriods();
    if (result.success && result.data) setPayPeriods(result.data);
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
  container: { padding: 16, gap: 10 },
  reimbursementsButton: { backgroundColor: accent.solid, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginBottom: 16 },
  reimbursementsButtonText: { color: "#fff", fontWeight: "600" },
  sectionTitle: { fontSize: 13, color: "#666", textTransform: "uppercase", marginBottom: 8 },
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { backgroundColor: accent.bg, borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: accent.fg },
  cardMeta: { fontSize: 13, color: "#666", marginTop: 2 },
});

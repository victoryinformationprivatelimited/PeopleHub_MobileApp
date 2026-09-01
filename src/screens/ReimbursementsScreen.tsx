import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { ReimbursementReturn } from "../type/payroll";
import { getMyReimbursements } from "../api/Payroll/PayrollAPI";
import { moduleColor } from "../theme";
import Card from "../components/Card";

const accent = moduleColor.payroll;

type Props = NativeStackScreenProps<RootStackParamList, "Reimbursements">;

export default function ReimbursementsScreen({ navigation }: Props) {
  const [items, setItems] = useState<ReimbursementReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await getMyReimbursements();
    if (result.success && result.data) setItems(result.data);
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
      data={items}
      keyExtractor={(item) => String(item.reimbursementId)}
      ListHeaderComponent={
        <Pressable
          style={styles.requestButton}
          onPress={() => navigation.navigate("RequestReimbursement")}
          testID="request-reimbursement-button"
        >
          <Text style={styles.requestButtonText}>Request reimbursement</Text>
        </Pressable>
      }
      ListEmptyComponent={<Text style={styles.empty}>No reimbursement requests yet.</Text>}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.type}>{item.reimbursementType}</Text>
            <Text style={styles.amount}>{item.amount.toFixed(2)}</Text>
          </View>
          {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          {item.payPeriodLabel ? <Text style={styles.meta}>Pay period: {item.payPeriodLabel}</Text> : null}
          {item.documentName ? <Text style={styles.meta}>Receipt: {item.documentName}</Text> : null}
          <Text style={styles.status}>{item.status}</Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 28, gap: 10 },
  requestButton: { backgroundColor: accent.solid, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginBottom: 16 },
  requestButtonText: { color: "#fff", fontWeight: "600" },
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { padding: 14, marginBottom: 10 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  type: { fontSize: 12, color: accent.fg, fontWeight: "700", textTransform: "uppercase" },
  amount: { fontSize: 16, fontWeight: "700", color: "#111" },
  description: { fontSize: 14, color: "#333", marginTop: 6 },
  meta: { fontSize: 12, color: "#666", marginTop: 4 },
  status: { fontSize: 12, color: "#555", fontWeight: "600", marginTop: 8 },
});

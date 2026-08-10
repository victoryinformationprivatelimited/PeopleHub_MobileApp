import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, FlatList, RefreshControl } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { LeaveEntitlementReturn } from "../type/leave";
import { getMyLeaveEntitlements } from "../api/Leave/LeaveAPI";

type Props = NativeStackScreenProps<RootStackParamList, "LeaveHome">;

export default function LeaveHomeScreen({ navigation }: Props) {
  const [entitlements, setEntitlements] = useState<LeaveEntitlementReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const result = await getMyLeaveEntitlements(new Date().getFullYear());
    if (result.success && result.data) setEntitlements(result.data);
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
      data={entitlements}
      keyExtractor={(item) => String(item.leaveTypeId)}
      ListHeaderComponent={
        <>
          <Pressable style={styles.applyButton} onPress={() => navigation.navigate("ApplyLeave")} testID="apply-leave-button">
            <Text style={styles.applyButtonText}>Apply for leave</Text>
          </Pressable>
          <View style={styles.tabsRow}>
            <TabButton label="Pending" onPress={() => navigation.navigate("LeaveRequests", { status: "Pending" })} />
            <TabButton label="Approved" onPress={() => navigation.navigate("LeaveRequests", { status: "Approved" })} />
            <TabButton label="Rejected" onPress={() => navigation.navigate("LeaveRequests", { status: "Rejected" })} />
          </View>
          <Text style={styles.sectionTitle}>Entitlements ({new Date().getFullYear()})</Text>
        </>
      }
      ListEmptyComponent={<Text style={styles.empty}>No leave entitlements found.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{item.leaveTypeName}</Text>
          <View style={styles.row}>
            <Stat label="Entitled" value={item.entitledDays} />
            <Stat label="Used" value={item.usedDays} />
            <Stat label="Pending" value={item.pendingDays} />
            <Stat label="Balance" value={item.balanceDays} />
          </View>
        </View>
      )}
    />
  );
}

function TabButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.tab} onPress={onPress} testID={`leave-tab-${label.toLowerCase()}`}>
      <Text style={styles.tabText}>{label}</Text>
    </Pressable>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  applyButton: { backgroundColor: "#0d6efd", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginBottom: 12 },
  applyButtonText: { color: "#fff", fontWeight: "600" },
  tabsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tab: { flex: 1, backgroundColor: "#f1f3f5", borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  tabText: { color: "#333", fontWeight: "600", fontSize: 13 },
  sectionTitle: { fontSize: 13, color: "#666", textTransform: "uppercase", marginBottom: 8 },
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { backgroundColor: "#f8f9fa", borderRadius: 12, padding: 14, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: "#111", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#111" },
  statLabel: { fontSize: 11, color: "#666" },
});

import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { LeaveEntitlementReturn } from "../type/leave";
import { getMyLeaveEntitlements } from "../api/Leave/LeaveAPI";
import { moduleColor } from "../theme";
import GradientHeader from "../components/GradientHeader";
import Card from "../components/Card";

const accent = moduleColor.leave;

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

  if (loading) return <SkeletonScreen />;

  const totalBalance = entitlements.reduce((sum, e) => sum + e.balanceDays, 0);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      data={entitlements}
      keyExtractor={(item) => String(item.leaveTypeId)}
      ListHeaderComponent={
        <>
          <GradientHeader style={styles.hero}>
            <Text style={styles.heroLabel}>Leave Balance</Text>
            <Text style={styles.heroAmount}>{totalBalance} day{totalBalance === 1 ? "" : "s"}</Text>
          </GradientHeader>
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
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>{item.leaveTypeName}</Text>
          <View style={styles.row}>
            <Stat label="Entitled" value={item.entitledDays} />
            <Stat label="Used" value={item.usedDays} />
            <Stat label="Pending" value={item.pendingDays} />
            <Stat label="Balance" value={item.balanceDays} />
          </View>
        </Card>
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
  container: { paddingBottom: 28, gap: 12 },
  hero: { marginBottom: 16 },
  heroLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  heroAmount: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 4 },
  applyButton: { backgroundColor: accent.solid, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginBottom: 12, marginHorizontal: 16 },
  applyButtonText: { color: "#fff", fontWeight: "600" },
  tabsRow: { flexDirection: "row", gap: 8, marginBottom: 16, marginHorizontal: 16 },
  tab: { flex: 1, backgroundColor: accent.bg, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  tabText: { color: accent.fg, fontWeight: "600", fontSize: 13 },
  sectionTitle: { fontSize: 13, color: "#666", textTransform: "uppercase", marginBottom: 12, marginHorizontal: 16 },
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { padding: 14, marginBottom: 10, marginHorizontal: 16 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: accent.fg, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#111" },
  statLabel: { fontSize: 11, color: "#666" },
});

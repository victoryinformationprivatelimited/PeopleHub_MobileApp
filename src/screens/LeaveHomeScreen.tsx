import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, RefreshControl } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { LeaveEntitlementReturn } from "../type/leave";
import { getMyLeaveEntitlements } from "../api/Leave/LeaveAPI";
import { moduleColor, brand } from "../theme";
import GradientHeader from "../components/GradientHeader";
import Card from "../components/Card";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { PlusSignCircleIcon, Clock01Icon, CheckmarkCircle02Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";

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
          <Pressable
            style={({ pressed }) => [styles.applyButton, pressed && styles.pressed]}
            onPress={() => navigation.navigate("ApplyLeave")}
            testID="apply-leave-button"
          >
            <HugeiconsIcon icon={PlusSignCircleIcon} size={18} color="#fff" strokeWidth={1.8} />
            <Text style={styles.applyButtonText}>Apply for leave</Text>
          </Pressable>
          <View style={styles.tabsRow}>
            <TabButton icon={Clock01Icon} label="Pending" onPress={() => navigation.navigate("LeaveRequests", { status: "Pending" })} />
            <TabButton icon={CheckmarkCircle02Icon} label="Approved" onPress={() => navigation.navigate("LeaveRequests", { status: "Approved" })} />
            <TabButton icon={CancelCircleIcon} label="Rejected" onPress={() => navigation.navigate("LeaveRequests", { status: "Rejected" })} />
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

function TabButton({ icon, label, onPress }: { icon: IconSvgElement; label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
      onPress={onPress}
      testID={`leave-tab-${label.toLowerCase()}`}
    >
      <HugeiconsIcon icon={icon} size={16} color={accent.fg} strokeWidth={1.8} />
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
  hero: { marginBottom: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  heroAmount: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 4 },
  pressed: { opacity: 0.85 },
  applyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: accent.solid,
    borderRadius: 14,
    paddingVertical: 15,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: accent.solid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  applyButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  tabsRow: { flexDirection: "row", gap: 8, marginBottom: 20, marginHorizontal: 16 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 11,
    borderWidth: 1.5,
    borderColor: brand.dark1 + "40",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: { color: accent.fg, fontWeight: "600", fontSize: 13 },
  sectionTitle: { fontSize: 13, color: accent.fg, fontWeight: "700", textTransform: "uppercase", marginBottom: 12, marginHorizontal: 16 },
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { padding: 14, marginBottom: 10, marginHorizontal: 16 },
  cardTitle: { fontSize: 15, fontWeight: "600", color: accent.fg, marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700", color: "#111" },
  statLabel: { fontSize: 11, color: "#666" },
});

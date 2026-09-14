import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { fetchLeaveEntitlements, invalidateEntitlements } from "../store/leaveSlice";
import type { AppDispatch, RootState } from "../store";
import { moduleColor, brand, neutral, semantic, leaveTypePalette } from "../theme";
import GradientHeader from "../components/GradientHeader";
import Card from "../components/Card";
import PieChart from "../components/PieChart";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import {
  PlusSignCircleIcon, Clock01Icon, CheckmarkCircle02Icon, CancelCircleIcon, Leaf01Icon,
} from "@hugeicons/core-free-icons";

const accent = moduleColor.leave;

type Props = NativeStackScreenProps<RootStackParamList, "LeaveHome">;

export default function LeaveHomeScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const slice = useSelector((state: RootState) => state.leave.entitlements);

  useEffect(() => {
    dispatch(fetchLeaveEntitlements(new Date().getFullYear()));
  }, [dispatch]);

  function onRefresh() {
    dispatch(invalidateEntitlements());
    dispatch(fetchLeaveEntitlements(new Date().getFullYear()));
  }

  if (slice.loading && slice.data == null) return <SkeletonScreen />;

  const entitlements = slice.data ?? [];
  const totalBalance = entitlements.reduce((sum, e) => sum + e.balanceDays, 0);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={slice.loading} onRefresh={onRefresh} />}
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
      ListEmptyComponent={
        <Text style={styles.empty}>
          {slice.error ? `Couldn't load: ${slice.error}` : "No leave entitlements found."}
        </Text>
      }
      renderItem={({ item, index }) => {
        const typeColor = leaveTypePalette[index % leaveTypePalette.length];
        return (
          <Card style={styles.typeCard}>
            <View style={styles.typeHeader}>
              <View style={[styles.typeIconBadge, { backgroundColor: typeColor + "1f" }]}>
                <HugeiconsIcon icon={Leaf01Icon} size={16} color={typeColor} strokeWidth={1.8} />
              </View>
              <Text style={styles.typeName} numberOfLines={1}>{item.leaveTypeName}</Text>
              <View style={styles.entitledChip}>
                <Text style={styles.entitledChipText}>{item.entitledDays} total</Text>
              </View>
            </View>
            <View style={styles.typeBody}>
              <PieChart
                size={78}
                strokeWidth={11}
                showLegend={false}
                centerLabel={`${item.balanceDays}`}
                segments={[
                  { label: "Used", value: item.usedDays, color: typeColor },
                  { label: "Pending", value: item.pendingDays, color: semantic.warning.solid },
                  { label: "Available", value: item.balanceDays, color: "#e2e5ea" },
                ]}
              />
              <View style={styles.typeStats}>
                <StatRow color={typeColor} label="Used" value={item.usedDays} />
                <StatRow color={semantic.warning.solid} label="Pending" value={item.pendingDays} />
                <StatRow color={brand.solid} label="Available" value={item.balanceDays} emphasize />
              </View>
            </View>
          </Card>
        );
      }}
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

function StatRow({ color, label, value, emphasize }: { color: string; label: string; value: number; emphasize?: boolean }) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statRowLabel}>{label}</Text>
      <Text style={[styles.statRowValue, emphasize && styles.statRowValueEmphasis]}>{value} day{value === 1 ? "" : "s"}</Text>
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
  typeCard: { padding: 16, marginBottom: 12, marginHorizontal: 16 },
  typeHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 },
  typeIconBadge: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  typeName: { flex: 1, fontSize: 15, fontWeight: "700", color: neutral.text },
  entitledChip: { backgroundColor: neutral.background, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: neutral.border },
  entitledChipText: { fontSize: 11, fontWeight: "600", color: neutral.textMuted },
  typeBody: { flexDirection: "row", alignItems: "center", gap: 18 },
  typeStats: { flex: 1, gap: 10 },
  statRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statDot: { width: 9, height: 9, borderRadius: 4.5 },
  statRowLabel: { flex: 1, fontSize: 13, color: neutral.textMuted },
  statRowValue: { fontSize: 13, fontWeight: "600", color: neutral.text },
  statRowValueEmphasis: { color: brand.dark1, fontWeight: "700" },
});

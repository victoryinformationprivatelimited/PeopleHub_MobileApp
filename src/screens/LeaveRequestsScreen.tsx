import { View, Text, StyleSheet, FlatList, RefreshControl } from "react-native";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { fetchLeaveRequests, invalidateRequests } from "../store/leaveSlice";
import type { AppDispatch, RootState } from "../store";
import { neutral, leaveStatusStyle } from "../theme";
import Card from "../components/Card";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Clock01Icon, CheckmarkCircle02Icon, CancelCircleIcon, Calendar03Icon, User03Icon,
} from "@hugeicons/core-free-icons";

const STATUS_ICON = {
  Pending: Clock01Icon,
  Approved: CheckmarkCircle02Icon,
  Rejected: CancelCircleIcon,
};

type Props = NativeStackScreenProps<RootStackParamList, "LeaveRequests">;

export default function LeaveRequestsScreen({ route, navigation }: Props) {
  const { status } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const slice = useSelector((state: RootState) => state.leave.requests[status]);

  useEffect(() => {
    navigation.setOptions({ title: `${status} Leave` });
    dispatch(fetchLeaveRequests(status));
  }, [status, dispatch]);

  function onRefresh() {
    dispatch(invalidateRequests(status));
    dispatch(fetchLeaveRequests(status));
  }

  if (slice.loading && slice.data == null) return <SkeletonScreen />;

  const items = slice.data ?? [];
  const style = leaveStatusStyle[status];

  return (
    <FlatList
      contentContainerStyle={styles.container}
      style={{ backgroundColor: neutral.background }}
      refreshControl={<RefreshControl refreshing={slice.loading} onRefresh={onRefresh} />}
      data={items}
      keyExtractor={(item) => String(item.leaveRequestId)}
      ListEmptyComponent={
        // A failed fetch isn't cached (by design, so pull-to-refresh can retry it), which means
        // it silently re-fires on every visit — surface the error instead of showing an empty
        // list, so a persistent failure is visible instead of looking like "no requests".
        <View style={styles.empty}>
          <View style={[styles.emptyIconBadge, { backgroundColor: style.bg }]}>
            <HugeiconsIcon icon={STATUS_ICON[status]} size={22} color={style.fg} strokeWidth={1.6} />
          </View>
          <Text style={styles.emptyText}>
            {slice.error ? `Couldn't load: ${slice.error}` : `No ${status.toLowerCase()} leave requests.`}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={[styles.accentStripe, { backgroundColor: style.solid }]} />
          <View style={styles.cardContent}>
            <View style={styles.headerRow}>
              <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                <HugeiconsIcon icon={STATUS_ICON[status]} size={14} color={style.fg} strokeWidth={2} />
                <Text style={[styles.statusBadgeText, { color: style.fg }]}>{status}</Text>
              </View>
              <Text style={styles.typeName} numberOfLines={1}>{item.leaveTypeName}</Text>
              <View style={styles.daysChip}>
                <Text style={styles.daysChipText}>{item.totalDays} day{item.totalDays === 1 ? "" : "s"}</Text>
              </View>
            </View>

            <View style={styles.dateRow}>
              <HugeiconsIcon icon={Calendar03Icon} size={14} color={neutral.textMuted} strokeWidth={1.8} />
              <Text style={styles.dateText}>{item.fromDate} → {item.toDate}</Text>
            </View>

            {item.reason ? <Text style={styles.reason} numberOfLines={2}>"{item.reason}"</Text> : null}

            {(status === "Pending" && item.currentApproverName) ||
             (status === "Approved" && item.approvedByName) ||
             (status === "Rejected" && item.rejectedByName) ? (
              <View style={styles.metaRow}>
                <HugeiconsIcon icon={User03Icon} size={13} color={neutral.textFaint} strokeWidth={1.8} />
                <Text style={styles.metaText} numberOfLines={2}>
                  {status === "Pending" && `Awaiting ${item.currentApproverName}${item.currentApproverRole ? ` · ${item.currentApproverRole}` : ""}`}
                  {status === "Approved" && `Approved by ${item.approvedByName}${item.approvedByRole ? ` · ${item.approvedByRole}` : ""}`}
                  {status === "Rejected" && `Rejected by ${item.rejectedByName}${item.rejectReason ? ` — ${item.rejectReason}` : ""}`}
                </Text>
              </View>
            ) : null}
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, gap: 12 },
  empty: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: neutral.border,
    borderStyle: "dashed",
    paddingVertical: 32,
    marginTop: 12,
  },
  emptyIconBadge: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  emptyText: { color: neutral.textMuted, fontSize: 13.5, fontWeight: "500" },
  card: { flexDirection: "row", padding: 0, overflow: "hidden" },
  accentStripe: { width: 5 },
  cardContent: { flex: 1, padding: 14, gap: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  typeName: { flex: 1, fontSize: 14.5, fontWeight: "700", color: neutral.text },
  daysChip: { backgroundColor: neutral.background, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3, borderWidth: 1, borderColor: neutral.border },
  daysChipText: { fontSize: 11.5, fontWeight: "600", color: neutral.textMuted },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  dateText: { fontSize: 13, color: neutral.textMuted, fontWeight: "500" },
  reason: { fontSize: 13, color: neutral.textMuted, fontStyle: "italic" },
  metaRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, marginTop: 2, paddingTop: 8, borderTopWidth: 1, borderTopColor: neutral.border },
  metaText: { flex: 1, fontSize: 12, color: neutral.textFaint, lineHeight: 16 },
});

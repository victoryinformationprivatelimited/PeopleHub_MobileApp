import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { LeaveRequestReturn } from "../type/leave";
import { getMyPendingLeaves, getMyApprovedLeaves, getMyRejectedLeaves } from "../api/Leave/LeaveAPI";
import { moduleColor } from "../theme";
import Card from "../components/Card";

const accent = moduleColor.leave;

type Props = NativeStackScreenProps<RootStackParamList, "LeaveRequests">;

const FETCHERS = {
  Pending: getMyPendingLeaves,
  Approved: getMyApprovedLeaves,
  Rejected: getMyRejectedLeaves,
} as const;

export default function LeaveRequestsScreen({ route, navigation }: Props) {
  const { status } = route.params;
  const [items, setItems] = useState<LeaveRequestReturn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: `${status} Leave` });
    FETCHERS[status]().then((result) => {
      if (result.success && result.data) setItems(result.data);
      setLoading(false);
    });
  }, [status]);

  if (loading) return <SkeletonScreen />;

  return (
    <FlatList
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      data={items}
      keyExtractor={(item) => String(item.leaveRequestId)}
      ListEmptyComponent={<Text style={styles.empty}>No {status.toLowerCase()} leave requests.</Text>}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <Text style={styles.type}>{item.leaveTypeName}</Text>
          <Text style={styles.dates}>{item.fromDate} → {item.toDate} ({item.totalDays} day{item.totalDays === 1 ? "" : "s"})</Text>
          {item.reason ? <Text style={styles.reason}>{item.reason}</Text> : null}
          {status === "Pending" && item.currentApproverName ? (
            <Text style={styles.meta}>Awaiting: {item.currentApproverName} ({item.currentApproverRole})</Text>
          ) : null}
          {status === "Approved" && item.approvedByName ? (
            <Text style={styles.meta}>Approved by {item.approvedByName} ({item.approvedByRole})</Text>
          ) : null}
          {status === "Rejected" && item.rejectedByName ? (
            <Text style={styles.meta}>Rejected by {item.rejectedByName}{item.rejectReason ? `: ${item.rejectReason}` : ""}</Text>
          ) : null}
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { padding: 14, marginBottom: 10 },
  type: { fontSize: 12, color: accent.fg, fontWeight: "700", textTransform: "uppercase" },
  dates: { fontSize: 15, fontWeight: "600", color: "#111", marginTop: 4 },
  reason: { fontSize: 13, color: "#555", marginTop: 4 },
  meta: { fontSize: 12, color: "#666", marginTop: 6 },
});

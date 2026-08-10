import { useEffect, useState, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator, FlatList } from "react-native";
import type { PendingApprovalReturn } from "../type/attendance";
import { getMyPendingApprovals, approveEmployeeRequest } from "../api/Attendance/AttendanceAPI";

/** Manager-side: pending EmployeeRequests where the caller's own Role is the required approver
 * (Phase 5's shared approval mechanism — roster/attendance/leave/reimbursement all land here). */
export default function PendingApprovalsScreen() {
  const [items, setItems] = useState<PendingApprovalReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getMyPendingApprovals();
    if (result.success && result.data) setItems(result.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(requestId: number, approve: boolean) {
    setActingOn(requestId);
    await approveEmployeeRequest(requestId, approve);
    setActingOn(null);
    load();
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <FlatList
      contentContainerStyle={{ padding: 16 }}
      data={items}
      keyExtractor={(item) => String(item.requestId)}
      ListEmptyComponent={<Text style={styles.empty}>Nothing pending.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.type}>{item.requestType}</Text>
          <Text style={styles.employee}>{item.employeeName}</Text>
          <Text style={styles.payload}>{item.payloadJson}</Text>
          <View style={styles.actions}>
            <Pressable
              style={[styles.actionButton, styles.reject]}
              onPress={() => respond(item.requestId, false)}
              disabled={actingOn === item.requestId}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.approve]}
              onPress={() => respond(item.requestId, true)}
              disabled={actingOn === item.requestId}
              testID={`approve-${item.requestId}`}
            >
              <Text style={styles.approveText}>Approve</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: "center", color: "#666", marginTop: 24 },
  card: { backgroundColor: "#f8f9fa", borderRadius: 12, padding: 14, marginBottom: 12 },
  type: { fontSize: 12, color: "#0d6efd", fontWeight: "700", textTransform: "uppercase" },
  employee: { fontSize: 16, fontWeight: "600", marginTop: 4 },
  payload: { fontSize: 12, color: "#666", marginTop: 6 },
  actions: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionButton: { flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: "center" },
  reject: { backgroundColor: "#fee2e2" },
  approve: { backgroundColor: "#d1f5e0" },
  rejectText: { color: "#b3261e", fontWeight: "600" },
  approveText: { color: "#146c43", fontWeight: "600" },
});

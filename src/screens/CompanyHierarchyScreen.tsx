import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, SectionList, RefreshControl } from "react-native";
import type { TeamMemberReturn } from "../type/orgHierarchy";
import { getMyTeam, getMyManagers } from "../api/OrgHierarchy/OrgHierarchyAPI";
import { moduleColor } from "../theme";

const accent = moduleColor.hierarchy;

interface Section {
  title: string;
  data: TeamMemberReturn[];
}

export default function CompanyHierarchyScreen() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [managersRes, teamRes] = await Promise.all([getMyManagers(), getMyTeam()]);
    setSections([
      { title: "My Managers", data: managersRes.success && managersRes.data ? managersRes.data : [] },
      { title: "My Team", data: teamRes.success && teamRes.data ? teamRes.data : [] },
    ]);
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
    <SectionList
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      sections={sections}
      keyExtractor={(item, index) => `${item.employeeId}-${index}`}
      renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? <Text style={styles.empty}>None found.</Text> : null
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.employeeName}</Text>
          <Text style={styles.meta}>{item.roleName}{item.unitEntityName ? ` · ${item.unitEntityName}` : ""}</Text>
          <Text style={styles.number}>{item.employeeNumber}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontSize: 13, color: accent.fg, textTransform: "uppercase", marginTop: 16, marginBottom: 8, backgroundColor: "#fff", fontWeight: "700" },
  empty: { color: "#999", fontSize: 13, fontStyle: "italic", marginBottom: 8 },
  card: { backgroundColor: accent.bg, borderRadius: 12, padding: 14, marginBottom: 10 },
  name: { fontSize: 15, fontWeight: "600", color: "#111" },
  meta: { fontSize: 13, color: "#555", marginTop: 2 },
  number: { fontSize: 12, color: "#999", marginTop: 4 },
});

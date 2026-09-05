import { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, SectionList, RefreshControl } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { TeamMemberReturn } from "../type/orgHierarchy";
import { getMyTeam, getMyManagers } from "../api/OrgHierarchy/OrgHierarchyAPI";
import { moduleColor } from "../theme";
import Card from "../components/Card";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { UserMultipleIcon } from "@hugeicons/core-free-icons";

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

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

  if (loading) return <SkeletonScreen />;

  return (
    <SectionList
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      sections={sections}
      keyExtractor={(item, index) => `${item.employeeId}-${index}`}
      renderSectionHeader={({ section }) => <Text style={styles.sectionTitle}>{section.title}</Text>}
      renderSectionFooter={({ section }) =>
        section.data.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconBadge}>
              <HugeiconsIcon icon={UserMultipleIcon} size={22} color={accent.fg} strokeWidth={1.6} />
            </View>
            <Text style={styles.emptyText}>None found.</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialsOf(item.employeeName) || "?"}</Text>
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.name}>{item.employeeName}</Text>
            <Text style={styles.meta}>{item.roleName}{item.unitEntityName ? ` · ${item.unitEntityName}` : ""}</Text>
            <Text style={styles.number}>{item.employeeNumber}</Text>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 12.5,
    color: accent.fg,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 20,
    marginBottom: 10,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(31,35,40,0.08)",
    borderStyle: "dashed",
    paddingVertical: 24,
    marginBottom: 8,
  },
  emptyIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: accent.bg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyText: { color: "#8a8f98", fontSize: 13.5, fontWeight: "500" },
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 10 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: accent.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: accent.fg, fontWeight: "700", fontSize: 15 },
  cardBody: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: "#111" },
  meta: { fontSize: 13, color: "#555", marginTop: 2 },
  number: { fontSize: 12, color: "#999", marginTop: 4 },
});

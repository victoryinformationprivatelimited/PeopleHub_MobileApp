import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, SectionList, ScrollView, RefreshControl, Image } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { SkeletonScreen } from "../components/Skeleton";
import OrgTreeList from "../components/OrgTreeList";
import OrgTreeDiagram from "../components/OrgTreeDiagram";
import { buildTree, type OrgEntityNode, type OrgRoleNode, type TeamMemberReturn } from "../type/orgHierarchy";
import {
  fetchMyTeam,
  fetchMyManagers,
  fetchCompanyStructure,
  fetchDesignationHierarchy,
  fetchMyOrgPosition,
  invalidate,
} from "../store/orgSlice";
import type { AppDispatch, RootState } from "../store";
import { brand, neutral, moduleColor } from "../theme";
import Card from "../components/Card";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import {
  UserMultipleIcon,
  GlobeIcon,
  Building02Icon,
  UserMultiple02Icon,
  Briefcase02Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import type { RootStackParamList } from "../navigation/types";
import { getSection, getBasicInfoRaw } from "../api/Profile/ProfileAPI";

type ViewMode = "tree" | "list";

/** List / Tree switcher — mirrors ESS's OrgTreePageShell header toggle (default: Tree). */
function ViewModeToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <View style={styles.toggleBar}>
      {(["tree", "list"] as ViewMode[]).map((m) => (
        <Pressable
          key={m}
          onPress={() => onChange(m)}
          style={[styles.togglePill, mode === m && styles.togglePillActive]}
          testID={`org-view-toggle-${m}`}
        >
          <Text style={[styles.togglePillText, mode === m && styles.togglePillTextActive]}>
            {m === "tree" ? "Tree" : "List"}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

type Props = NativeStackScreenProps<RootStackParamList, "CompanyHierarchySection">;

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

const accent = moduleColor.hierarchy;

/** Root entity/role gets Globe, next level Building, then Users, then Briefcase for anything
 * deeper — ported from ESS's LEVEL_ICONS scheme (NodeDiagram.tsx). */
const LEVEL_ICONS: IconSvgElement[] = [GlobeIcon, Building02Icon, UserMultiple02Icon, Briefcase02Icon];
function iconForLevel(depth: number): IconSvgElement {
  return LEVEL_ICONS[Math.min(depth, LEVEL_ICONS.length - 1)];
}

function EmptyState() {
  return (
    <View style={styles.container}>
      <View style={styles.empty}>
        <View style={styles.emptyIconBadge}>
          <HugeiconsIcon icon={UserMultipleIcon} size={22} color={accent.fg} strokeWidth={1.6} />
        </View>
        <Text style={styles.emptyText}>None found.</Text>
      </View>
    </View>
  );
}

function PersonListSection({ view }: { view: "myTeam" }) {
  const dispatch = useDispatch<AppDispatch>();
  const key = "team" as const;
  const slice = useSelector((state: RootState) => state.org[key]);
  const fetchThunk = fetchMyTeam;

  useEffect(() => {
    dispatch(fetchThunk());
  }, [dispatch]);

  function onRefresh() {
    dispatch(invalidate(key));
    dispatch(fetchThunk());
  }

  if (slice.loading && slice.data == null) return <SkeletonScreen />;

  const data = slice.data ?? [];

  return (
    <SectionList
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={slice.loading} onRefresh={onRefresh} />}
      sections={[{ title: "", data }]}
      keyExtractor={(item, index) => `${item.employeeId}-${index}`}
      renderSectionFooter={() => (data.length === 0 ? <EmptyState /> : null)}
      renderItem={({ item }) => (
        <Card style={styles.card}>
          <View style={styles.avatar}>
            {item.employeeImage ? (
              <Image source={{ uri: item.employeeImage }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initialsOf(item.employeeName) || "?"}</Text>
            )}
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

/** Same TeamMemberReturn shape as the API returns, plus a flag marking the logged-in employee's
 * own card (which the API never returns — appended client-side below). */
type ChainPerson = TeamMemberReturn & { isMe?: boolean };

function fieldValue(fields: { label: string; value: string | null }[], label: string): string | null {
  return fields.find((f) => f.label === label)?.value ?? null;
}

/** Fetches the logged-in employee's own name/number/role/image, the same sections HomeScreen
 * reads from, so the reporting chain can end with a "You" card at the bottom. */
function useMyself(): ChainPerson | null {
  const [me, setMe] = useState<ChainPerson | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getSection("basic"), getBasicInfoRaw(), getSection("employment")]).then(
      ([basicRes, basicRawRes, employmentRes]) => {
        if (cancelled) return;

        let employeeName = "";
        let employeeNumber = "";
        const basicPayload = basicRes.success ? basicRes.data : null;
        if (basicPayload?.type === "fields") {
          const fields = basicPayload.fields;
          const first = fieldValue(fields, "First Name") ?? "";
          const last = fieldValue(fields, "Last Name") ?? "";
          employeeName = [first, last].filter(Boolean).join(" ");
          employeeNumber = fieldValue(fields, "Employee Number") ?? "";
        }

        let roleName = "";
        let unitEntityName = "";
        const employmentPayload = employmentRes.success ? employmentRes.data : null;
        if (employmentPayload?.type === "fields") {
          const fields = employmentPayload.fields;
          roleName = fieldValue(fields, "Role") ?? "";
          unitEntityName = fieldValue(fields, "Entity") ?? "";
        }

        const employeeImage = basicRawRes.success ? basicRawRes.data?.employeeImage ?? null : null;

        setMe({
          employeeId: -1,
          employeeNumber,
          employeeName: employeeName || "You",
          roleId: null,
          roleName,
          roleLevel: null,
          unitEntityId: null,
          unitEntityName,
          employeeImage,
          isMe: true,
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return me;
}

/** "My Managers" as a vertical reporting chain, top (most senior) to bottom, ending with the
 * logged-in employee's own card — the real GetMyManagers response is ordered closest-manager-first
 * up to the root, so it's reversed here before appending "me" at the very bottom. */
function ManagerChainSection() {
  const dispatch = useDispatch<AppDispatch>();
  const slice = useSelector((state: RootState) => state.org.managers);
  const me = useMyself();

  useEffect(() => {
    dispatch(fetchMyManagers());
  }, [dispatch]);

  function onRefresh() {
    dispatch(invalidate("managers"));
    dispatch(fetchMyManagers());
  }

  if (slice.loading && slice.data == null) return <SkeletonScreen />;

  const managers = slice.data ?? [];
  if (managers.length === 0) return <EmptyState />;

  const chain: ChainPerson[] = [...managers].reverse();
  if (me) chain.push(me);

  return (
    <ScrollView
      contentContainerStyle={styles.chainContainer}
      refreshControl={<RefreshControl refreshing={slice.loading} onRefresh={onRefresh} />}
    >
      {chain.map((person, index) => (
        <View key={`${person.employeeId}-${index}`} style={styles.chainItem}>
          <Card style={person.isMe ? [styles.chainCard, styles.chainCardMe] : styles.chainCard}>
            <View style={[styles.avatar, person.isMe && styles.avatarMe]}>
              {person.employeeImage ? (
                <Image source={{ uri: person.employeeImage }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initialsOf(person.employeeName) || "?"}</Text>
              )}
            </View>
            <View style={styles.cardBody}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{person.employeeName}</Text>
                {person.isMe ? (
                  <View style={styles.meBadge}>
                    <Text style={styles.meBadgeText}>You</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.meta}>
                {person.roleName}
                {person.unitEntityName ? ` · ${person.unitEntityName}` : ""}
              </Text>
              {person.employeeNumber ? <Text style={styles.number}>{person.employeeNumber}</Text> : null}
            </View>
          </Card>
          {index < chain.length - 1 ? (
            <HugeiconsIcon icon={ArrowUp01Icon} size={18} color="#9aa3ad" strokeWidth={2} />
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

function CompanyStructureSection() {
  const dispatch = useDispatch<AppDispatch>();
  const entities = useSelector((state: RootState) => state.org.companyStructure);
  const myPosition = useSelector((state: RootState) => state.org.myPosition);
  const [mode, setMode] = useState<ViewMode>("tree");

  useEffect(() => {
    dispatch(fetchCompanyStructure());
    dispatch(fetchMyOrgPosition());
  }, [dispatch]);

  if (entities.loading && entities.data == null) return <SkeletonScreen />;

  const tree = buildTree<OrgEntityNode>(entities.data ?? [], (e) => e.entityId);
  if (tree.length === 0) return <EmptyState />;

  return (
    <View style={styles.screen}>
      <ViewModeToggle mode={mode} onChange={setMode} />
      {mode === "tree" ? (
        <OrgTreeDiagram
          tree={tree}
          getId={(e) => e.entityId}
          getLabel={(e) => e.entityName}
          getCaption={(e) => e.typeName}
          getIcon={(_e, depth) => iconForLevel(depth)}
          getHead={(e) => (e.headEmployeeName ? { name: e.headEmployeeName, designation: e.headDesignation } : null)}
          isCurrent={(e) => myPosition.data != null && e.entityId === myPosition.data.entityId}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <OrgTreeList
            tree={tree}
            getId={(e) => e.entityId}
            getLabel={(e) => e.entityName}
            getCaption={(e) => e.typeName}
            getIcon={(_e, depth) => iconForLevel(depth)}
            getHead={(e) => (e.headEmployeeName ? { name: e.headEmployeeName, designation: e.headDesignation } : null)}
            getEmployees={(e) => e.employees}
            isCurrent={(e) => myPosition.data != null && e.entityId === myPosition.data.entityId}
          />
        </ScrollView>
      )}
    </View>
  );
}

function DesignationHierarchySection() {
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector((state: RootState) => state.org.designationHierarchy);
  const myPosition = useSelector((state: RootState) => state.org.myPosition);
  const [mode, setMode] = useState<ViewMode>("tree");

  useEffect(() => {
    dispatch(fetchDesignationHierarchy());
    dispatch(fetchMyOrgPosition());
  }, [dispatch]);

  if (roles.loading && roles.data == null) return <SkeletonScreen />;

  const tree = buildTree<OrgRoleNode>(roles.data ?? [], (r) => r.roleId);
  if (tree.length === 0) return <EmptyState />;

  return (
    <View style={styles.screen}>
      <ViewModeToggle mode={mode} onChange={setMode} />
      {mode === "tree" ? (
        <OrgTreeDiagram
          tree={tree}
          getId={(r) => r.roleId}
          getLabel={(r) => r.roleName}
          getIcon={(_r, depth) => iconForLevel(depth)}
          isCurrent={(r) => myPosition.data != null && r.roleId === myPosition.data.employeeRoleId}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <OrgTreeList
            tree={tree}
            getId={(r) => r.roleId}
            getLabel={(r) => r.roleName}
            getIcon={(_r, depth) => iconForLevel(depth)}
            getEmployees={(r) => r.employees}
            isCurrent={(r) => myPosition.data != null && r.roleId === myPosition.data.employeeRoleId}
          />
        </ScrollView>
      )}
    </View>
  );
}

export default function CompanyHierarchySectionScreen({ route, navigation }: Props) {
  const { view, label } = route.params;

  useEffect(() => {
    navigation.setOptions({ title: label });
  }, [navigation, label]);

  return (
    <View style={styles.screen}>
      {view === "myTeam" ? <PersonListSection view={view} /> : null}
      {view === "myManagers" ? <ManagerChainSection /> : null}
      {view === "companyStructure" ? <CompanyStructureSection /> : null}
      {view === "designationHierarchy" ? <DesignationHierarchySection /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: neutral.background },
  toggleBar: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: neutral.border,
  },
  togglePill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: accent.bg,
  },
  togglePillActive: { backgroundColor: brand.solid },
  togglePillText: { fontSize: 13, fontWeight: "600", color: accent.fg },
  togglePillTextActive: { color: "#fff" },
  container: { padding: 16, paddingBottom: 32 },
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
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: accent.fg, fontWeight: "700", fontSize: 15 },
  cardBody: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontSize: 15, fontWeight: "600", color: "#111" },
  meta: { fontSize: 13, color: "#555", marginTop: 2 },
  number: { fontSize: 12, color: "#999", marginTop: 4 },
  chainContainer: { padding: 16, paddingBottom: 32, alignItems: "center" },
  chainItem: { width: "100%", maxWidth: 420, alignItems: "center" },
  chainCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 6, width: "100%" },
  chainCardMe: { borderWidth: 1.5, borderColor: brand.solid },
  avatarMe: { borderWidth: 2, borderColor: brand.solid },
  meBadge: { backgroundColor: brand.solid, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  meBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});

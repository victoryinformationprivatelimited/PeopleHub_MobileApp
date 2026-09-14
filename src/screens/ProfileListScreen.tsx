import { useEffect, useState } from "react";
import { SectionList, Text, Pressable, View, StyleSheet, Image } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import {
  ArrowRight02Icon,
  Logout01Icon,
  IdIcon,
  CreditCardAcceptIcon,
  Contact01Icon,
  Briefcase02Icon,
  Clock01Icon,
  Wallet01Icon,
  Clock03Icon,
  GraduationCapIcon,
  Certificate01Icon,
  GlobeIcon,
  StarAward01Icon,
  PassportIcon,
  Shield01Icon,
  FileTextIcon,
  Alert01Icon,
  TaskDone01Icon,
  LockIcon,
  HeartIcon,
  SmileIcon,
  UserGroupIcon,
  TrophyIcon,
  Folder01Icon,
  HeartPulseIcon,
  LogOutIcon,
  EarthIcon,
} from "@hugeicons/core-free-icons";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { setLoggedOut } from "../store/authSlice";
import { logout } from "../api/Auth/AuthAPI";
import { fetchSection } from "../store/profileSlice";
import { getBasicInfoRaw } from "../api/Profile/ProfileAPI";
import { SECTION_GROUPS } from "../type/sectionMeta";
import type { SectionId } from "../type/profile";
import type { RootStackParamList } from "../navigation/types";
import { moduleColor, semantic } from "../theme";
import GradientHeader from "../components/GradientHeader";
import Card from "../components/Card";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileList">;

/** Per-section icon, each card visually distinct by shape rather than color — this app uses one
 * consistent brand green everywhere (theme.ts's moduleColor comment), so every badge shares the
 * same tint instead of a color-per-section palette. */
const sectionAccent = moduleColor.profile;

const SECTION_ICONS: Record<SectionId, IconSvgElement> = {
  basic: IdIcon,
  carddetails: CreditCardAcceptIcon,
  contact: Contact01Icon,
  employment: Briefcase02Icon,
  attendance: Clock01Icon,
  compensation: Wallet01Icon,
  workhistory: Clock03Icon,
  qualifications: GraduationCapIcon,
  certifications: Certificate01Icon,
  languages: GlobeIcon,
  skills: StarAward01Icon,
  visa: PassportIcon,
  bgcheck: Shield01Icon,
  agreements: FileTextIcon,
  disciplinary: Alert01Icon,
  policy: TaskDone01Icon,
  privacy: LockIcon,
  engagements: HeartIcon,
  hobbies: SmileIcon,
  groups: UserGroupIcon,
  recognition: TrophyIcon,
  documents: Folder01Icon,
  health: HeartPulseIcon,
  exit: LogOutIcon,
  global: EarthIcon,
};

function fieldValue(fields: { label: string; value: string | null }[], label: string): string | null {
  return fields.find((f) => f.label === label)?.value ?? null;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default function ProfileListScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const basic = useSelector((state: RootState) => state.profile.sections.basic);
  const [employeeImage, setEmployeeImage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchSection("basic"));
    getBasicInfoRaw().then((res) => {
      if (res.success) setEmployeeImage(res.data?.employeeImage ?? null);
    });
  }, []);

  const basicFields = basic?.data?.type === "fields" ? basic.data.fields : [];
  const fullName = [fieldValue(basicFields, "First Name"), fieldValue(basicFields, "Last Name")]
    .filter(Boolean)
    .join(" ");
  const employeeNumber = fieldValue(basicFields, "Employee Number") ?? "";

  const sections = SECTION_GROUPS.map((g) => ({ title: g.title, data: g.items }));

  async function handleLogout() {
    await logout();
    dispatch(setLoggedOut());
  }

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListHeaderComponent={
          <>
            <GradientHeader style={styles.hero}>
              <View style={styles.heroCentered}>
                <View style={styles.avatarLarge}>
                  {employeeImage ? (
                    <Image source={{ uri: employeeImage }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarLargeText}>{initialsOf(fullName) || "?"}</Text>
                  )}
                </View>
                <Text style={styles.heroNameCentered}>{fullName || "Employee"}</Text>
                {employeeNumber ? <Text style={styles.heroMetaCentered}>{employeeNumber}</Text> : null}
              </View>
            </GradientHeader>
            <Pressable onPress={() => navigation.navigate("CompanyHierarchy")} testID="profile-hierarchy-link">
              <Card style={styles.hierarchyLink}>
                <View style={styles.hierarchyLinkRow}>
                  <Text style={styles.hierarchyLinkText}>View Company Hierarchy</Text>
                  <HugeiconsIcon icon={ArrowRight02Icon} size={16} color={moduleColor.profile.fg} strokeWidth={1.8} />
                </View>
              </Card>
            </Pressable>
          </>
        }
        renderSectionHeader={({ section }) => <Text style={styles.header}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.sectionCard, pressed && styles.sectionCardPressed]}
            onPress={() => navigation.navigate("ProfileSection", { sectionId: item.id, label: item.label })}
            testID={`profile-section-${item.id}`}
          >
            <View style={[styles.sectionIconBadge, { backgroundColor: sectionAccent.bg }]}>
              <HugeiconsIcon icon={SECTION_ICONS[item.id]} size={19} color={sectionAccent.fg} strokeWidth={1.8} />
            </View>
            <View style={styles.sectionCardBody}>
              <Text style={styles.sectionCardTitle}>{item.label}</Text>
              <Text style={styles.sectionCardCaption}>Tap to view details</Text>
            </View>
            <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="#9aa3ad" strokeWidth={1.8} />
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [styles.logout, pressed && styles.logoutPressed]}
            onPress={handleLogout}
            testID="logout-button"
          >
            <HugeiconsIcon icon={Logout01Icon} size={17} color={semantic.destructive.fg} strokeWidth={1.8} />
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroCentered: { alignItems: "center" },
  avatarLarge: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 3, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarLargeText: { color: "#fff", fontWeight: "700", fontSize: 32 },
  heroNameCentered: { color: "#fff", fontWeight: "700", fontSize: 20, textAlign: "center" },
  heroMetaCentered: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 3, textAlign: "center" },
  hierarchyLink: {
    margin: 16,
    padding: 15,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  hierarchyLinkRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  hierarchyLinkText: { color: moduleColor.profile.fg, fontWeight: "700" },
  header: {
    fontSize: 12.5,
    fontWeight: "700",
    color: moduleColor.profile.fg,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginHorizontal: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionCardPressed: { backgroundColor: "#f5f6f7" },
  sectionIconBadge: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  sectionCardBody: { flex: 1 },
  sectionCardTitle: { fontSize: 14.5, color: "#1f2328", fontWeight: "600" },
  sectionCardCaption: { fontSize: 12, color: "#9aa3ad", marginTop: 2 },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    marginTop: 24,
    padding: 15,
    backgroundColor: semantic.destructive.fg + "1f",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: semantic.destructive.fg + "33",
  },
  logoutPressed: { opacity: 0.8 },
  logoutText: { color: semantic.destructive.fg, fontWeight: "700", fontSize: 15 },
});

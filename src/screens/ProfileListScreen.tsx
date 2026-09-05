import { useEffect, useState } from "react";
import { SectionList, Text, Pressable, View, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowRight02Icon, Logout01Icon } from "@hugeicons/core-free-icons";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { setLoggedOut } from "../store/authSlice";
import { logout } from "../api/Auth/AuthAPI";
import { getSection } from "../api/Profile/ProfileAPI";
import { SECTION_GROUPS } from "../type/sectionMeta";
import type { RootStackParamList } from "../navigation/types";
import { moduleColor, semantic } from "../theme";
import GradientHeader from "../components/GradientHeader";
import Card from "../components/Card";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileList">;

function fieldValue(fields: { label: string; value: string | null }[], label: string): string | null {
  return fields.find((f) => f.label === label)?.value ?? null;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

export default function ProfileListScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [fullName, setFullName] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");

  useEffect(() => {
    getSection("basic").then((result) => {
      if (result.success && result.data?.type === "fields") {
        const fields = result.data.fields;
        const first = fieldValue(fields, "First Name") ?? "";
        const last = fieldValue(fields, "Last Name") ?? "";
        setFullName([first, last].filter(Boolean).join(" "));
        setEmployeeNumber(fieldValue(fields, "Employee Number") ?? "");
      }
    });
  }, []);

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
              <View style={styles.heroRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initialsOf(fullName) || "?"}</Text>
                </View>
                <View>
                  <Text style={styles.heroName}>{fullName || "Employee"}</Text>
                  {employeeNumber ? <Text style={styles.heroMeta}>{employeeNumber}</Text> : null}
                </View>
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
        renderItem={({ item, index, section }) => {
          const isFirst = index === 0;
          const isLast = index === section.data.length - 1;
          return (
            <Pressable
              style={({ pressed }) => [
                styles.row,
                isFirst && styles.rowFirst,
                isLast && styles.rowLast,
                !isLast && styles.rowDivider,
                pressed && styles.rowPressed,
              ]}
              onPress={() => navigation.navigate("ProfileSection", { sectionId: item.id, label: item.label })}
            >
              <Text style={styles.rowText}>{item.label}</Text>
              <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="#9aa3ad" strokeWidth={1.8} />
            </Pressable>
          );
        }}
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
  heroRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 2, borderColor: "#fff",
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 20 },
  heroName: { color: "#fff", fontWeight: "700", fontSize: 18 },
  heroMeta: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginHorizontal: 16,
  },
  rowFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  rowLast: { borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: "rgba(31,35,40,0.08)" },
  rowPressed: { backgroundColor: "#f5f6f7" },
  rowText: { fontSize: 15, color: "#1f2328", fontWeight: "500" },
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

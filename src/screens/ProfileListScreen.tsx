import { useEffect, useState } from "react";
import { SectionList, Text, Pressable, View, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { setLoggedOut } from "../store/authSlice";
import { logout } from "../api/Auth/AuthAPI";
import { getSection } from "../api/Profile/ProfileAPI";
import { SECTION_GROUPS } from "../type/sectionMeta";
import type { RootStackParamList } from "../navigation/types";
import { moduleColor, semantic } from "../theme";
import GradientHeader from "../components/GradientHeader";

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
        ListHeaderComponent={
          <>
            <GradientHeader>
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
            <Pressable style={styles.hierarchyLink} onPress={() => navigation.navigate("CompanyHierarchy")} testID="profile-hierarchy-link">
              <Text style={styles.hierarchyLinkText}>View Company Hierarchy →</Text>
            </Pressable>
          </>
        }
        renderSectionHeader={({ section }) => <Text style={styles.header}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate("ProfileSection", { sectionId: item.id, label: item.label })}
          >
            <Text style={styles.rowText}>{item.label}</Text>
          </Pressable>
        )}
        ListFooterComponent={
          <Pressable style={styles.logout} onPress={handleLogout} testID="logout-button">
            <Text style={styles.logoutText}>Log out</Text>
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  hierarchyLink: { backgroundColor: moduleColor.profile.bg, margin: 16, padding: 14, borderRadius: 10, alignItems: "center" },
  hierarchyLinkText: { color: moduleColor.profile.fg, fontWeight: "600" },
  header: { backgroundColor: moduleColor.profile.bg, paddingHorizontal: 16, paddingVertical: 6, fontSize: 12, fontWeight: "700", color: moduleColor.profile.fg },
  row: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  rowText: { fontSize: 15, color: "#111" },
  logout: { margin: 16, padding: 14, backgroundColor: semantic.destructive.bg, borderRadius: 8, alignItems: "center" },
  logoutText: { color: semantic.destructive.fg, fontWeight: "600" },
});

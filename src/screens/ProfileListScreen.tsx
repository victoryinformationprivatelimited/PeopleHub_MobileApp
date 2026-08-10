import { SectionList, Text, Pressable, View, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import { setLoggedOut } from "../store/authSlice";
import { logout } from "../api/Auth/AuthAPI";
import { SECTION_GROUPS } from "../type/sectionMeta";
import type { RootStackParamList } from "../navigation/types";
import { moduleColor, semantic } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileList">;

export default function ProfileListScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();

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
  header: { backgroundColor: moduleColor.profile.bg, paddingHorizontal: 16, paddingVertical: 6, fontSize: 12, fontWeight: "700", color: moduleColor.profile.fg },
  row: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
  rowText: { fontSize: 15, color: "#111" },
  logout: { margin: 16, padding: 14, backgroundColor: semantic.destructive.bg, borderRadius: 8, alignItems: "center" },
  logoutText: { color: semantic.destructive.fg, fontWeight: "600" },
});

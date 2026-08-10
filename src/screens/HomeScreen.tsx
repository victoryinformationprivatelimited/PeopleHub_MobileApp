import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { neutral, moduleColor, type ModuleKey } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const TILES: { key: ModuleKey; label: string; subtitle: string; badge: string; route: keyof RootStackParamList; testID: string }[] = [
  { key: "profile", label: "Profile", subtitle: "Your personal & employment details", badge: "P", route: "ProfileList", testID: "home-profile-button" },
  { key: "attendance", label: "Attendance & Roster", subtitle: "Roster, mark attendance, approvals", badge: "A", route: "AttendanceHome", testID: "home-attendance-button" },
  { key: "leave", label: "Leave", subtitle: "Entitlements, requests, apply", badge: "L", route: "LeaveHome", testID: "home-leave-button" },
  { key: "payroll", label: "Payroll", subtitle: "Payslips & reimbursements", badge: "$", route: "PayrollHome", testID: "home-payroll-button" },
  { key: "hierarchy", label: "Company Hierarchy", subtitle: "Your team & managers", badge: "H", route: "CompanyHierarchy", testID: "home-hierarchy-button" },
];

export default function HomeScreen({ navigation }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Welcome back</Text>
      <Text style={styles.greetingSub}>What do you need today?</Text>

      {TILES.map((tile) => {
        const c = moduleColor[tile.key];
        return (
          <Pressable
            key={tile.key}
            style={[styles.tile, { backgroundColor: c.bg, borderColor: c.fg + "22" }]}
            onPress={() => navigation.navigate(tile.route as any)}
            testID={tile.testID}
          >
            <View style={[styles.badge, { backgroundColor: c.solid }]}>
              <Text style={styles.badgeText}>{tile.badge}</Text>
            </View>
            <View style={styles.tileTextGroup}>
              <Text style={[styles.tileText, { color: c.fg }]}>{tile.label}</Text>
              <Text style={styles.tileSubtitle}>{tile.subtitle}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, backgroundColor: neutral.background },
  greeting: { fontSize: 22, fontWeight: "700", color: neutral.text, marginTop: 4 },
  greetingSub: { fontSize: 14, color: neutral.textMuted, marginBottom: 12 },
  tile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  badge: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  tileTextGroup: { flex: 1 },
  tileText: { fontSize: 16, fontWeight: "700" },
  tileSubtitle: { fontSize: 12, color: neutral.textMuted, marginTop: 2 },
});

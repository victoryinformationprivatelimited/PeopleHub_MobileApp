import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import {
  ArrowRight02Icon,
  UserMultiple02Icon,
  UserGroupIcon,
  Structure02Icon,
  Briefcase02Icon,
} from "@hugeicons/core-free-icons";
import type { RootStackParamList } from "../navigation/types";
import type { OrgHierarchyView } from "../type/orgHierarchy";
import { neutral, moduleColor } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "CompanyHierarchy">;

const accent = moduleColor.hierarchy;

/** Menu of the 4 Company Hierarchy destinations — ESS has these as 4 separate pages/routes
 * (not tabs of one screen), so mobile mirrors that with 4 cards navigating to one shared detail
 * screen, using the same section-card design as the Profile screen's list. */
const ITEMS: { view: OrgHierarchyView; label: string; caption: string; icon: IconSvgElement }[] = [
  { view: "myTeam", label: "My Team", caption: "People in your entity", icon: UserMultiple02Icon },
  { view: "myManagers", label: "My Managers", caption: "Your reporting chain", icon: UserGroupIcon },
  { view: "companyStructure", label: "Company Structure", caption: "Entities and units", icon: Structure02Icon },
  { view: "designationHierarchy", label: "Designation Hierarchy", caption: "Roles and levels", icon: Briefcase02Icon },
];

export default function CompanyHierarchyScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {ITEMS.map((item) => (
        <Pressable
          key={item.view}
          style={({ pressed }) => [styles.sectionCard, pressed && styles.sectionCardPressed]}
          onPress={() => navigation.navigate("CompanyHierarchySection", { view: item.view, label: item.label })}
          testID={`hierarchy-card-${item.view}`}
        >
          <View style={styles.sectionIconBadge}>
            <HugeiconsIcon icon={item.icon} size={19} color={accent.fg} strokeWidth={1.8} />
          </View>
          <View style={styles.sectionCardBody}>
            <Text style={styles.sectionCardTitle}>{item.label}</Text>
            <Text style={styles.sectionCardCaption}>{item.caption}</Text>
          </View>
          <HugeiconsIcon icon={ArrowRight02Icon} size={16} color="#9aa3ad" strokeWidth={1.8} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: neutral.background },
  container: { padding: 16, paddingBottom: 32 },
  sectionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
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
    backgroundColor: accent.bg,
    alignItems: "center", justifyContent: "center",
  },
  sectionCardBody: { flex: 1 },
  sectionCardTitle: { fontSize: 14.5, color: "#1f2328", fontWeight: "600" },
  sectionCardCaption: { fontSize: 12, color: "#9aa3ad", marginTop: 2 },
});

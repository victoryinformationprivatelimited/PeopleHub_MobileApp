import { Pressable, Text, View, StyleSheet } from "react-native";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { neutral } from "../theme";
import Card from "./Card";

/** Matches PeopleHub-ESS's quick-stat cards. `tint` gives each tile its own accent color
 * (icon badge + value) so a row of tiles reads as distinct at a glance instead of all-green. */
export default function StatTile({
  icon, value, label, tint, onPress, testID,
}: {
  icon: IconSvgElement;
  value: string;
  label: string;
  tint?: { bg: string; fg: string };
  onPress?: () => void;
  testID?: string;
}) {
  const Wrapper = onPress ? Pressable : View;
  const badgeBg = tint?.bg ?? "#e6f2ee";
  const fg = tint?.fg ?? neutral.text;
  return (
    <Wrapper style={styles.wrapper} onPress={onPress} testID={testID}>
      <Card style={styles.tile}>
        <View style={[styles.badge, { backgroundColor: badgeBg }]}>
          <HugeiconsIcon icon={icon} size={18} color={fg} strokeWidth={1.8} />
        </View>
        <Text style={[styles.value, { color: fg }]}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </Card>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  tile: { paddingVertical: 16, paddingHorizontal: 10, alignItems: "center", gap: 5 },
  badge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  value: { fontSize: 18, fontWeight: "700" },
  label: { fontSize: 11.5, color: neutral.textMuted, fontWeight: "500" },
});

import { Pressable, Text, View, StyleSheet } from "react-native";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { brand, neutral } from "../theme";
import Card from "./Card";

/** Matches PeopleHub-ESS's quick-stat cards, now on a frosted GlassCard instead of a flat
 * white one, with a real HugeIcons glyph in the badge instead of a plain-text symbol. */
export default function StatTile({
  icon, value, label, onPress, testID,
}: {
  icon: IconSvgElement;
  value: string;
  label: string;
  onPress?: () => void;
  testID?: string;
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper style={styles.wrapper} onPress={onPress} testID={testID}>
      <Card style={styles.tile}>
        <View style={styles.badge}>
          <HugeiconsIcon icon={icon} size={17} color={brand.dark1} strokeWidth={1.8} />
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </Card>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  tile: { padding: 14, alignItems: "center", gap: 4 },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#e6f2ee", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  value: { fontSize: 17, fontWeight: "700", color: neutral.text },
  label: { fontSize: 12, color: neutral.textMuted },
});

import { Pressable, Text, View, StyleSheet } from "react-native";
import { brand, neutral } from "../theme";

/** Matches the Figma design's Home-screen quick-stat cards: white card, light-teal icon badge
 * with a letter/symbol standing in for an icon (no icon library in this project), bold value,
 * muted label. Optionally pressable to jump to the relevant tab. */
export default function StatTile({
  symbol, value, label, onPress, testID,
}: {
  symbol: string;
  value: string;
  label: string;
  onPress?: () => void;
  testID?: string;
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper style={styles.tile} onPress={onPress} testID={testID}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{symbol}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, backgroundColor: neutral.card, borderRadius: 14, padding: 14, alignItems: "center", gap: 4 },
  badge: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#e0f7fa", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  badgeText: { color: brand.dark2, fontWeight: "700", fontSize: 14 },
  value: { fontSize: 17, fontWeight: "700", color: neutral.text },
  label: { fontSize: 12, color: neutral.textMuted },
});

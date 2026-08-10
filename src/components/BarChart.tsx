import { View, Text, StyleSheet } from "react-native";
import { brand, neutral } from "../theme";

export interface BarDatum {
  label: string;
  value: number;
}

const CHART_HEIGHT = 140;

/** Plain View-based bar chart (no SVG needed for straight rectangles) — matches the Figma
 * design's Earnings Breakdown bars. Only ever fed real line-item amounts, never fabricated
 * figures, per PayslipReturn.PayrollEngineConfigured's own honesty rule. */
export default function BarChart({ data }: { data: BarDatum[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {data.map((d, i) => (
          <View key={i} style={styles.barColumn}>
            <View style={[styles.bar, { height: Math.max((d.value / max) * CHART_HEIGHT, 4) }]} />
            <Text style={styles.barValue}>{d.value.toFixed(0)}</Text>
            <Text style={styles.barLabel} numberOfLines={1}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 12, height: CHART_HEIGHT + 36 },
  barColumn: { flex: 1, alignItems: "center", justifyContent: "flex-end" },
  bar: { width: "70%", backgroundColor: brand.solid, borderRadius: 6, minHeight: 4 },
  barValue: { fontSize: 11, color: neutral.textMuted, marginTop: 4 },
  barLabel: { fontSize: 11, color: neutral.textMuted, marginTop: 2 },
});

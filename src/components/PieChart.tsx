import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { neutral } from "../theme";

export interface PieSegment {
  label: string;
  value: number;
  color: string;
}

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Donut chart built on react-native-svg stroke-dasharray tricks (stacked Circle strokes) —
 * matches the Figma design's Attendance pie chart without pulling in a full charting library
 * for one visual. */
export default function PieChart({ segments, centerLabel }: { segments: PieSegment[]; centerLabel?: string }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  let offset = 0;

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke="#eef0f3" strokeWidth={STROKE} fill="none" />
        {segments.map((segment, i) => {
          const fraction = segment.value / total;
          const dash = fraction * CIRCUMFERENCE;
          const circle = (
            <Circle
              key={i}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={segment.color}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              fill="none"
              // SVG circles start at 3 o'clock; rotate -90deg so the chart starts at 12 o'clock.
              rotation={-90}
              origin={`${SIZE / 2}, ${SIZE / 2}`}
            />
          );
          offset += dash;
          return circle;
        })}
      </Svg>
      {centerLabel ? (
        <View style={styles.centerLabelWrap}>
          <Text style={styles.centerLabel}>{centerLabel}</Text>
        </View>
      ) : null}
      <View style={styles.legend}>
        {segments.map((segment, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: segment.color }]} />
            <Text style={styles.legendText}>{segment.label} ({segment.value})</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  centerLabelWrap: { position: "absolute", top: SIZE / 2 - 14, width: SIZE, alignItems: "center" },
  centerLabel: { fontSize: 20, fontWeight: "700", color: neutral.text },
  legend: { marginTop: 14, gap: 6, width: "100%" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: neutral.textMuted },
});

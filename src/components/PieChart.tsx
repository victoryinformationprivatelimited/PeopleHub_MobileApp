import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { neutral } from "../theme";

export interface PieSegment {
  label: string;
  value: number;
  color: string;
}

const DEFAULT_SIZE = 160;
const DEFAULT_STROKE = 22;

/** Donut chart built on react-native-svg stroke-dasharray tricks (stacked Circle strokes) —
 * matches the Figma design's Attendance pie chart without pulling in a full charting library
 * for one visual. `size`/`strokeWidth` let smaller multiples (e.g. per-leave-type cards) reuse
 * this without dragging in the full-size legend. */
export default function PieChart({
  segments, centerLabel, size = DEFAULT_SIZE, strokeWidth = DEFAULT_STROKE, showLegend = true,
}: {
  segments: PieSegment[];
  centerLabel?: string;
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#eef0f3" strokeWidth={strokeWidth} fill="none" />
        {segments.map((segment, i) => {
          const fraction = segment.value / total;
          const dash = fraction * circumference;
          const circle = (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              fill="none"
              // SVG circles start at 3 o'clock; rotate -90deg so the chart starts at 12 o'clock.
              rotation={-90}
              origin={`${size / 2}, ${size / 2}`}
            />
          );
          offset += dash;
          return circle;
        })}
      </Svg>
      {centerLabel ? (
        <View style={[styles.centerLabelWrap, { top: size / 2 - 14, width: size }]}>
          <Text style={styles.centerLabel}>{centerLabel}</Text>
        </View>
      ) : null}
      {showLegend ? (
        <View style={styles.legend}>
          {segments.map((segment, i) => (
            <View key={i} style={styles.legendRow}>
              <View style={[styles.swatch, { backgroundColor: segment.color }]} />
              <Text style={styles.legendText}>{segment.label} ({segment.value})</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" },
  centerLabelWrap: { position: "absolute", alignItems: "center" },
  centerLabel: { fontSize: 20, fontWeight: "700", color: neutral.text },
  legend: { marginTop: 14, gap: 6, width: "100%" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: neutral.textMuted },
});

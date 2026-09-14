import { Pressable, Text, View, StyleSheet, type ViewStyle } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { PartyIcon, Coffee01Icon } from "@hugeicons/core-free-icons";
import type { RosterReturn } from "../type/attendance";
import { brand, neutral } from "../theme";

export interface ShiftColor {
  bg: string;
  fg: string;
}

interface Props {
  date: string;
  day: RosterReturn | null;
  loading: boolean;
  shiftColor: ShiftColor | null;
  isToday: boolean;
  isFuture: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/** One cell of the roster month grid — mirrors PeopleHub-ESS's RosterDayBox (holiday/weekend
 * markers, shift-colored background, today outline), sized for a 7-column mobile grid. */
export default function RosterDayBox({ date, day, loading, shiftColor, isToday, isFuture, onPress, style }: Props) {
  const dayNumber = new Date(date + "T00:00:00").getDate();
  const hasNoRoster = !day?.workPatternName && !day?.rosterStartTime && !day?.rosterEndTime;

  const categoryColor = day?.isHoliday
    ? { bg: "#f3e8ff", fg: "#7c3aed" }
    : !hasNoRoster
      ? (day?.workPatternName ? shiftColor : null)
      : day?.isWeekend
        ? { bg: neutral.background, fg: neutral.textMuted }
        : null;

  const marker = day?.isHoliday
    ? { label: "Holiday", icon: PartyIcon }
    : hasNoRoster && day?.isWeekend
      ? { label: "Off", icon: Coffee01Icon }
      : null;

  return (
    <Pressable
      style={[
        styles.cell,
        style,
        categoryColor ? { backgroundColor: categoryColor.bg } : null,
        isToday && styles.cellToday,
      ]}
      onPress={isFuture ? onPress : undefined}
      disabled={!isFuture}
      testID={`roster-day-${date}`}
    >
      <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{dayNumber}</Text>

      {loading ? (
        <View style={styles.shimmer} />
      ) : marker ? (
        <View style={styles.markerBadge}>
          <HugeiconsIcon icon={marker.icon} size={11} color={categoryColor?.fg ?? neutral.textMuted} strokeWidth={1.8} />
          <Text style={[styles.markerText, categoryColor && { color: categoryColor.fg }]} numberOfLines={1}>{marker.label}</Text>
        </View>
      ) : day?.rosterStartTime ? (
        <View>
          <Text style={[styles.shiftName, categoryColor && { color: categoryColor.fg }]} numberOfLines={1}>{day.workPatternName}</Text>
          <Text style={[styles.shiftTime, categoryColor && { color: categoryColor.fg }]} numberOfLines={1}>
            {day.rosterStartTime}–{day.rosterEndTime}
          </Text>
        </View>
      ) : (
        <Text style={styles.noRoster}>—</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    minHeight: 62,
    borderRadius: 10,
    padding: 5,
  },
  cellToday: { borderWidth: 1.5, borderColor: brand.solid },
  dayNumber: { fontSize: 11.5, fontWeight: "700", color: neutral.text },
  dayNumberToday: { color: brand.dark1 },
  shimmer: { height: 20, borderRadius: 4, backgroundColor: neutral.border, marginTop: 4 },
  markerBadge: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 },
  markerText: { fontSize: 9, fontWeight: "600", color: neutral.textMuted },
  shiftName: { fontSize: 9.5, fontWeight: "600", color: neutral.text, marginTop: 4 },
  shiftTime: { fontSize: 8.5, color: neutral.textMuted, marginTop: 1 },
  noRoster: { fontSize: 10, color: neutral.textFaint, marginTop: 4 },
});

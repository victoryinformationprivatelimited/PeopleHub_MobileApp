import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, RefreshControl, LayoutChangeEvent } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { ArrowLeft01Icon, ArrowRight01Icon, CalendarRangeIcon } from "@hugeicons/core-free-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { RosterReturn } from "../type/attendance";
import { fetchRosterRange, invalidateRosterRange, rosterRangeKey } from "../store/rosterSlice";
import type { AppDispatch, RootState } from "../store";
import { moduleColor, neutral, rosterShiftPalette } from "../theme";
import Card from "../components/Card";
import RosterDayBox, { type ShiftColor } from "../components/RosterDayBox";

const accent = moduleColor.attendance;
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const GAP = 6;
const COLUMNS = 7;

type Props = NativeStackScreenProps<RootStackParamList, "RosterCalendar">;

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toDateOnly(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function isFutureDate(iso: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(iso + "T00:00:00") > today;
}

/** Assigns a color to each distinct shift type in the order it's first seen, so the same shift
 * keeps the same color across the visible month — ported from PeopleHub-ESS's buildShiftColorMap. */
function buildShiftColorMap(days: RosterReturn[]): Record<string, ShiftColor> {
  const map: Record<string, ShiftColor> = {};
  let next = 0;
  for (const d of days) {
    if (!d.workPatternName) continue;
    if (!(d.workPatternName in map)) {
      map[d.workPatternName] = rosterShiftPalette[next % rosterShiftPalette.length];
      next++;
    }
  }
  return map;
}

export default function RosterCalendarScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
  const [gridWidth, setGridWidth] = useState(0);

  const monthStart = `${year}-${pad(month)}-01`;
  const monthEnd = `${year}-${pad(month)}-${pad(new Date(year, month, 0).getDate())}`;
  const key = rosterRangeKey(monthStart, monthEnd);

  const slice = useSelector(
    (state: RootState) => state.roster.rangesByKey[key] ?? { data: null, loading: false, error: null },
  );
  const data = slice.data;
  const loading = slice.loading;
  const error = slice.error;

  useEffect(() => {
    dispatch(fetchRosterRange({ fromDate: monthStart, toDate: monthEnd }));
  }, [dispatch, monthStart, monthEnd]);

  function onRefresh() {
    dispatch(invalidateRosterRange(key));
    dispatch(fetchRosterRange({ fromDate: monthStart, toDate: monthEnd }));
  }

  function goPrevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); } else { setMonth((m) => m - 1); }
  }
  function goNextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); } else { setMonth((m) => m + 1); }
  }

  const dayMap = useMemo(() => {
    const map = new Map<string, RosterReturn>();
    (data ?? []).forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  const shiftColorMap = useMemo(() => buildShiftColorMap(data ?? []), [data]);

  const monthCells = useMemo(() => {
    const firstWeekday = new Date(year, month - 1, 1).getDay();
    const total = new Date(year, month, 0).getDate();
    const cells: (string | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let d = 1; d <= total; d++) cells.push(`${year}-${pad(month)}-${pad(d)}`);
    return cells;
  }, [year, month]);

  const monthLabel = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const todayIso = toDateOnly(today);
  const cellSize = gridWidth > 0 ? (gridWidth - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  function onGridLayout(e: LayoutChangeEvent) {
    setGridWidth(e.nativeEvent.layout.width);
  }

  const legendEntries = Object.entries(shiftColorMap);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      style={{ backgroundColor: neutral.background }}
      refreshControl={<RefreshControl refreshing={loading && data != null} onRefresh={onRefresh} />}
    >
      <Card style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={[styles.headerIconBadge, { backgroundColor: accent.bg }]}>
            <HugeiconsIcon icon={CalendarRangeIcon} size={18} color={accent.fg} strokeWidth={1.8} />
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Your shift schedule</Text>
            <Text style={styles.headerSubtitle}>Tap a future date to request a change</Text>
          </View>
        </View>
        <View style={styles.monthNav}>
          <Pressable style={styles.navButton} onPress={goPrevMonth} testID="roster-prev-month">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color={accent.fg} strokeWidth={2} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable style={styles.navButton} onPress={goNextMonth} testID="roster-next-month">
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={accent.fg} strokeWidth={2} />
          </Pressable>
        </View>
      </Card>

      <Card style={styles.gridCard}>
        {error ? <Text style={styles.errorText}>Couldn't load the roster: {error}</Text> : null}

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((w) => (
            <Text key={w} style={[styles.weekdayLabel, { width: cellSize || undefined, flex: cellSize ? undefined : 1 }]}>{w}</Text>
          ))}
        </View>

        <View style={styles.grid} onLayout={onGridLayout}>
          {monthCells.map((date, i) => {
            if (!date) return <View key={`pad-${i}`} style={{ width: cellSize, height: 62 }} />;
            const day = dayMap.get(date) ?? null;
            const cellLoading = loading && !day;
            return (
              <RosterDayBox
                key={date}
                date={date}
                day={day}
                loading={cellLoading}
                shiftColor={day?.workPatternName ? shiftColorMap[day.workPatternName] ?? null : null}
                isToday={date === todayIso}
                isFuture={isFutureDate(date)}
                onPress={() => navigation.navigate("RequestRosterChange", { rosterDate: date })}
                style={{ width: cellSize }}
              />
            );
          })}
        </View>

        {legendEntries.length > 0 ? (
          <View style={styles.legend}>
            {legendEntries.map(([name, color]) => (
              <View key={name} style={styles.legendItem}>
                <View style={[styles.legendSwatch, { backgroundColor: color.bg, borderColor: color.fg }]} />
                <Text style={styles.legendText}>{name}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32, gap: 14 },
  headerCard: { padding: 16, gap: 14 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIconBadge: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: "700", color: neutral.text },
  headerSubtitle: { fontSize: 12, color: neutral.textMuted, marginTop: 2 },
  monthNav: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16 },
  navButton: {
    width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center",
    backgroundColor: neutral.background, borderWidth: 1, borderColor: neutral.border,
  },
  monthLabel: { fontSize: 14, fontWeight: "700", color: neutral.text, minWidth: 130, textAlign: "center" },
  gridCard: { padding: 14 },
  errorText: { fontSize: 12.5, color: "#b3261e", backgroundColor: "#fdecec", borderRadius: 8, padding: 10, marginBottom: 10 },
  weekdayRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  weekdayLabel: { fontSize: 10.5, fontWeight: "700", color: neutral.textFaint, textAlign: "center", textTransform: "uppercase" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: GAP },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: neutral.border },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendSwatch: { width: 12, height: 12, borderRadius: 3, borderWidth: 1.5 },
  legendText: { fontSize: 12, color: neutral.textMuted, fontWeight: "500" },
});

import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { Rocket01Icon, Target01Icon, SparklesIcon, Award01Icon, StartUp02Icon } from "@hugeicons/core-free-icons";
import type { RootStackParamList } from "../navigation/types";
import type { JourneyMilestone } from "../type/journey";
import { getMyJourney } from "../api/Journey/JourneyAPI";
import { neutral, brand } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "MyJourney">;

/** Rotates through a fixed icon + color pair per milestone position, same idea as the Leave
 * Home screen's leaveTypePalette — keeps each stop visually distinct regardless of how many
 * milestones the backend eventually returns. */
const STOPS: { icon: IconSvgElement; color: string }[] = [
  { icon: Rocket01Icon, color: "#2563eb" },
  { icon: Target01Icon, color: "#0891b2" },
  { icon: SparklesIcon, color: brand.solid },
  { icon: Award01Icon, color: "#d97706" },
  { icon: StartUp02Icon, color: "#7c3aed" },
];

export default function MyJourneyScreen({}: Props) {
  const [milestones, setMilestones] = useState<JourneyMilestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyJourney().then((result) => {
      if (result.success && result.data) setMilestones(result.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <SkeletonScreen />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.progressCard}>
        <View style={styles.progressHeaderRow}>
          <Text style={styles.progressLabel}>Journey progress</Text>
          <Text style={styles.progressCount}>{milestones.length} milestones</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: milestones.length ? "100%" : "0%" }]} />
        </View>
      </View>

      <View style={styles.timeline}>
        {milestones.map((milestone, i) => {
          const stop = STOPS[i % STOPS.length];
          const isLast = i === milestones.length - 1;
          return (
            <View key={milestone.milestoneId} style={styles.row}>
              <View style={styles.railColumn}>
                <View style={[styles.node, { backgroundColor: stop.color }]}>
                  <HugeiconsIcon icon={stop.icon} size={18} color="#fff" strokeWidth={1.8} />
                </View>
                {!isLast ? <View style={styles.connector} /> : null}
              </View>
              <View style={styles.cardWrap}>
                <View style={styles.card}>
                  <Text style={[styles.category, { color: stop.color }]}>{milestone.category.toUpperCase()}</Text>
                  <Text style={styles.title}>{milestone.title}</Text>
                  {milestone.description ? <Text style={styles.description}>{milestone.description}</Text> : null}
                  <Text style={styles.date}>{milestone.date}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const NODE_SIZE = 40;

const styles = StyleSheet.create({
  screen: { backgroundColor: neutral.background },
  container: { padding: 16, paddingBottom: 32 },
  progressCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: neutral.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  progressHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  progressLabel: { fontSize: 13.5, fontWeight: "600", color: neutral.text },
  progressCount: { fontSize: 12.5, color: neutral.textMuted },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: neutral.background, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: brand.solid },
  timeline: { marginTop: 20 },
  row: { flexDirection: "row" },
  railColumn: { width: NODE_SIZE, alignItems: "center" },
  node: {
    width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 2,
  },
  connector: { width: 2, flex: 1, minHeight: 28, backgroundColor: neutral.border, marginVertical: 2 },
  cardWrap: { flex: 1, paddingLeft: 12, paddingBottom: 20 },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: neutral.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  category: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  title: { fontSize: 14.5, fontWeight: "700", color: neutral.text, marginTop: 4 },
  description: { fontSize: 12.5, color: neutral.textMuted, marginTop: 4 },
  date: { fontSize: 11.5, color: neutral.textFaint, marginTop: 8 },
});

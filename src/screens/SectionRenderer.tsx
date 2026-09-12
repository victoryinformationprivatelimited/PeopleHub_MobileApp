import { View, Text, StyleSheet } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { File01Icon, InboxIcon } from "@hugeicons/core-free-icons";
import type { BadgeStatus, SectionPayload } from "../type/profile";
import { moduleColor, neutral, semantic } from "../theme";
import { Skeleton } from "../components/Skeleton";
import Card from "../components/Card";

const accent = moduleColor.profile;

const BADGE_COLOR: Record<BadgeStatus, { bg: string; fg: string }> = {
  approved: { bg: semantic.success.bg, fg: semantic.success.fg },
  rejected: { bg: semantic.destructive.bg, fg: semantic.destructive.fg },
  pending: { bg: semantic.warning.bg, fg: semantic.warning.fg },
  draft: { bg: neutral.border, fg: neutral.textMuted },
  info: { bg: semantic.info.bg, fg: semantic.info.fg },
};

function Badge({ status, text }: { status: BadgeStatus; text: string }) {
  const c = BADGE_COLOR[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.fg }]}>{text}</Text>
    </View>
  );
}

interface Props {
  loading: boolean;
  error: string | null;
  payload: SectionPayload | null;
}

export function SectionRenderer({ loading, error, payload }: Props) {
  if (loading) {
    return (
      <Card style={styles.card}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={[styles.row, i === 4 && styles.rowLast]}>
            <Skeleton width="35%" height={11} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={15} />
          </View>
        ))}
      </Card>
    );
  }
  if (error) {
    return (
      <Card style={[styles.card, styles.stateCard]}>
        <Text style={styles.errorText}>{error}</Text>
      </Card>
    );
  }
  if (!payload) return null;

  switch (payload.type) {
    case "fields":
    case "reveal":
      return (
        <Card style={styles.card}>
          {payload.fields.map((f, i) => (
            <View key={f.label} style={[styles.row, i === payload.fields.length - 1 && styles.rowLast]}>
              <Text style={styles.label}>{f.label}</Text>
              {f.badge ? (
                <Badge status={f.badge.status} text={f.badge.text} />
              ) : (
                <Text style={styles.value}>{f.value ?? "—"}</Text>
              )}
            </View>
          ))}
        </Card>
      );
    case "entries":
      return (
        <View style={styles.stack}>
          {payload.entries.map((e, i) => (
            <Card key={i} style={styles.entryCard}>
              <View style={styles.entryTop}>
                <Text style={styles.entryTitle}>{e.title}</Text>
                {e.badge ? <Badge status={e.badge.status} text={e.badge.text} /> : null}
              </View>
              {e.sub ? <Text style={styles.entrySub}>{e.sub}</Text> : null}
            </Card>
          ))}
        </View>
      );
    case "tags":
      return (
        <Card style={[styles.card, styles.tagsCard]}>
          <View style={styles.tagsWrap}>
            {payload.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </Card>
      );
    case "documents":
      return (
        <View style={styles.stack}>
          {payload.documents.map((d, i) => (
            <Card key={i} style={styles.entryCard}>
              <View style={styles.docRow}>
                <View style={styles.docIcon}>
                  <HugeiconsIcon icon={File01Icon} size={18} color={accent.fg} strokeWidth={1.8} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.entryTitle}>{d.name}</Text>
                  <Text style={styles.entrySub}>{d.type}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      );
    case "empty":
      return (
        <Card style={[styles.card, styles.stateCard]}>
          <HugeiconsIcon icon={InboxIcon} size={28} color={neutral.textFaint} strokeWidth={1.5} />
          <Text style={styles.emptyText}>{payload.emptyText ?? "No data available."}</Text>
        </Card>
      );
  }
}

const styles = StyleSheet.create({
  card: { padding: 4 },
  stack: { gap: 10 },
  stateCard: { alignItems: "center", justifyContent: "center", paddingVertical: 32, gap: 10 },
  errorText: { color: semantic.destructive.fg, fontSize: 14, textAlign: "center" },
  emptyText: { color: neutral.textMuted, fontSize: 14, fontStyle: "italic" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: neutral.border,
  },
  rowLast: { borderBottomWidth: 0 },
  label: { fontSize: 13, color: neutral.textMuted, flexShrink: 1 },
  value: { fontSize: 15, color: neutral.text, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  entryCard: { padding: 14 },
  entryTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  entryTitle: { fontSize: 15, fontWeight: "700", color: neutral.text, flexShrink: 1 },
  entrySub: { fontSize: 13, color: neutral.textMuted, marginTop: 4 },
  docRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  docIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: accent.bg,
    alignItems: "center", justifyContent: "center",
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  tagsCard: { padding: 14 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { backgroundColor: accent.bg, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  tagText: { color: accent.fg, fontSize: 13, fontWeight: "600" },
});

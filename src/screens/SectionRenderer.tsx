import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import type { SectionPayload } from "../type/profile";

interface Props {
  loading: boolean;
  error: string | null;
  payload: SectionPayload | null;
}

export function SectionRenderer({ loading, error, payload }: Props) {
  if (loading) return <ActivityIndicator style={styles.center} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!payload) return null;

  switch (payload.type) {
    case "fields":
    case "reveal":
      return (
        <View>
          {payload.fields.map((f) => (
            <View key={f.label} style={styles.row}>
              <Text style={styles.label}>{f.label}</Text>
              <Text style={styles.value}>{f.badge ? f.badge.text : (f.value ?? "—")}</Text>
            </View>
          ))}
        </View>
      );
    case "entries":
      return (
        <View>
          {payload.entries.map((e, i) => (
            <View key={i} style={styles.entry}>
              <Text style={styles.entryTitle}>{e.title}</Text>
              {e.sub ? <Text style={styles.entrySub}>{e.sub}</Text> : null}
              {e.badge ? <Text style={styles.badge}>{e.badge.text}</Text> : null}
            </View>
          ))}
        </View>
      );
    case "tags":
      return (
        <View style={styles.tagsWrap}>
          {payload.tags.map((t) => (
            <Text key={t} style={styles.tag}>{t}</Text>
          ))}
        </View>
      );
    case "documents":
      return (
        <View>
          {payload.documents.map((d, i) => (
            <View key={i} style={styles.entry}>
              <Text style={styles.entryTitle}>{d.name}</Text>
              <Text style={styles.entrySub}>{d.type}</Text>
            </View>
          ))}
        </View>
      );
    case "empty":
      return <Text style={styles.empty}>{payload.emptyText ?? "No data available."}</Text>;
  }
}

const styles = StyleSheet.create({
  center: { marginTop: 24 },
  error: { color: "#b3261e", padding: 16 },
  row: { borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 10 },
  label: { fontSize: 12, color: "#666" },
  value: { fontSize: 15, color: "#111", marginTop: 2 },
  entry: { borderBottomWidth: 1, borderBottomColor: "#eee", paddingVertical: 10 },
  entryTitle: { fontSize: 15, fontWeight: "600", color: "#111" },
  entrySub: { fontSize: 13, color: "#666", marginTop: 2 },
  badge: { marginTop: 4, alignSelf: "flex-start", backgroundColor: "#e7f3ff", color: "#0d6efd", fontSize: 11, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { backgroundColor: "#f1f3f5", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, fontSize: 13 },
  empty: { color: "#666", padding: 16, fontStyle: "italic" },
});

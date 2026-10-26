import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { PackageAddIcon, SentIcon } from "@hugeicons/core-free-icons";
import type { RootStackParamList } from "../navigation/types";
import type { ApiResult } from "../api/client";
import type { AssetRequestStatus, MyAssetRequest, RequestableCategory } from "../type/assets";
import { answerAssetRequest, cancelAssetRequest, getMyAssetRequests, getRequestableCategories, submitAssetRequest } from "../api/Assets/AssetsAPI";
import { neutral, semantic, moduleColor } from "../theme";
import { SkeletonScreen } from "../components/Skeleton";
import Card from "../components/Card";
import { fmtDate, ymdFromToday } from "./assetFormat";

const accent = moduleColor.profile;

type Props = NativeStackScreenProps<RootStackParamList, "RequestAsset">;
type Flash = { tone: "success" | "error"; text: string } | null;

const QUICK_DATES: { label: string; days: number }[] = [
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "In a week", days: 7 },
  { label: "In 2 weeks", days: 14 },
];

function statusLook(s: AssetRequestStatus): { bg: string; fg: string; text: string } {
  switch (s) {
    case "Issued": return { ...semantic.success, text: "Issued to you" };
    case "Approved": return { ...semantic.info, text: "Approved, being arranged" };
    case "Reserved": return { ...semantic.info, text: "Reserved for you" };
    case "Rejected": return { ...semantic.destructive, text: "Rejected" };
    case "Cancelled": return { ...semantic.info, text: "Cancelled" };
    case "Info Requested": return { ...semantic.warning, text: "Waiting for your reply" };
    default: return { ...semantic.warning, text: "Waiting for approval" };
  }
}

export default function RequestAssetScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<RequestableCategory[]>([]);
  const [requests, setRequests] = useState<MyAssetRequest[] | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [busy, setBusy] = useState(false);

  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [purpose, setPurpose] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [details, setDetails] = useState("");
  const [replies, setReplies] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    const [c, r] = await Promise.all([getRequestableCategories(), getMyAssetRequests()]);
    setCategories(c.data ?? []);
    setRequests(r.data ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function run<T>(call: Promise<ApiResult<T>>, onOk?: () => void) {
    setBusy(true);
    const r = await call;
    setBusy(false);
    setFlash({ tone: r.success ? "success" : "error", text: r.message });
    if (r.success) {
      onOk?.();
      await load();
    }
  }

  if (requests === null) return <SkeletonScreen />;

  const valid = categoryId !== null && !!purpose.trim() && !!requiredDate;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBadge}>
            <HugeiconsIcon icon={PackageAddIcon} size={20} color={accent.fg} strokeWidth={1.8} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.title}>Request an asset</Text>
            <Text style={styles.meta}>A manager approves it first</Text>
          </View>
        </View>

        {flash ? (
          <View
            accessibilityRole={flash.tone === "error" ? "alert" : undefined}
            style={[styles.flash, { backgroundColor: flash.tone === "success" ? semantic.success.bg : semantic.destructive.bg }]}
          >
            <Text style={{ color: flash.tone === "success" ? semantic.success.fg : semantic.destructive.fg, fontSize: 12.5 }}>{flash.text}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>What do you need?</Text>
        <View style={styles.chipRow}>
          {categories.map((c) => (
            <Pressable key={c.id} style={[styles.chip, categoryId === c.id && styles.chipSelected]} onPress={() => setCategoryId(c.id)} accessibilityState={{ selected: categoryId === c.id }}>
              <Text style={[styles.chipText, categoryId === c.id && styles.chipTextSelected]}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>What is it for?</Text>
        <TextInput style={styles.input} value={purpose} onChangeText={setPurpose} placeholder="Replacement for a broken laptop" accessibilityLabel="What is it for?" testID="request-purpose" />

        <Text style={styles.label}>Needed by</Text>
        <View style={styles.chipRow}>
          {QUICK_DATES.map((q) => {
            const value = ymdFromToday(q.days);
            return (
              <Pressable key={q.label} style={[styles.chip, requiredDate === value && styles.chipSelected]} onPress={() => setRequiredDate(value)} accessibilityState={{ selected: requiredDate === value }}>
                <Text style={[styles.chipText, requiredDate === value && styles.chipTextSelected]}>{q.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <TextInput
          style={[styles.input, styles.dateInput]}
          value={requiredDate}
          onChangeText={setRequiredDate}
          placeholder="Or type a date, YYYY-MM-DD"
          autoCapitalize="none"
          keyboardType="numbers-and-punctuation"
          accessibilityLabel="Needed by date"
          testID="request-date"
        />
        {requiredDate ? <Text style={styles.meta}>{fmtDate(requiredDate) || "Not a valid date yet"}</Text> : null}

        <Text style={styles.label}>Anything else we should know? (optional)</Text>
        <TextInput style={[styles.input, styles.multiline]} value={details} onChangeText={setDetails} multiline accessibilityLabel="Details" testID="request-details" />

        <Pressable
          style={({ pressed }) => [styles.primaryButton, (!valid || busy) && styles.disabled, pressed && styles.pressed]}
          disabled={!valid || busy}
          onPress={() =>
            run(submitAssetRequest({ categoryId: categoryId!, purpose, requiredDate, details }), () => {
              setCategoryId(null);
              setPurpose("");
              setRequiredDate("");
              setDetails("");
            })
          }
          testID="request-submit"
        >
          {busy ? <ActivityIndicator color="#fff" /> : (
            <>
              <HugeiconsIcon icon={SentIcon} size={16} color="#fff" strokeWidth={1.8} />
              <Text style={styles.primaryButtonText}>Send request</Text>
            </>
          )}
        </Pressable>
        <Text style={styles.footnote}>Approval does not guarantee an item is in stock. If it is not, it is passed to procurement.</Text>
        <Pressable onPress={() => navigation.navigate("MyAssets")} style={styles.linkButton}>
          <Text style={styles.linkText}>See what you already hold</Text>
        </Pressable>
      </Card>

      <Text style={styles.sectionLabel}>My requests</Text>
      {requests.length === 0 ? <Text style={styles.empty}>You have not requested anything yet.</Text> : null}
      {requests.map((r) => {
        const look = statusLook(r.status);
        const open = !["Issued", "Rejected", "Cancelled"].includes(r.status);
        const question = [...r.steps].reverse().find((s) => s.action === "Returned for information");
        return (
          <Card key={r.id} style={styles.card}>
            <View style={styles.reportRow}>
              <Text style={[styles.name, styles.flex]}>#{r.id} · {r.category}</Text>
              <View style={[styles.pill, { backgroundColor: look.bg }]}>
                <Text style={[styles.pillText, { color: look.fg }]}>{look.text}</Text>
              </View>
            </View>
            <Text style={styles.detail}>{r.purpose}</Text>
            <Text style={styles.meta}>Needed by {fmtDate(r.requiredDate)} · requested {fmtDate(r.createdOn)}</Text>

            {r.status === "Info Requested" && question ? (
              <View style={styles.ask}>
                <Text style={styles.askTitle}>{question.by} asks:</Text>
                <Text style={styles.askText}>{question.comment}</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={replies[r.id] ?? ""}
                  onChangeText={(t) => setReplies({ ...replies, [r.id]: t })}
                  multiline
                  accessibilityLabel={`Reply to request ${r.id}`}
                  testID={`request-reply-${r.id}`}
                />
                <Pressable
                  style={({ pressed }) => [styles.primaryButton, (busy || !(replies[r.id] ?? "").trim()) && styles.disabled, pressed && styles.pressed]}
                  disabled={busy || !(replies[r.id] ?? "").trim()}
                  onPress={() => run(answerAssetRequest(r.id, replies[r.id]), () => setReplies({ ...replies, [r.id]: "" }))}
                  testID={`request-reply-send-${r.id}`}
                >
                  <Text style={styles.primaryButtonText}>Send reply</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.steps}>
              {r.steps.map((s, i) => (
                <Text key={i} style={styles.meta}>
                  <Text style={styles.stepAction}>{s.action}</Text> by {s.by}
                  {s.comment && r.status !== "Info Requested" ? `: ${s.comment}` : ""}
                </Text>
              ))}
            </View>
            {open ? (
              <Pressable style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]} disabled={busy} onPress={() => run(cancelAssetRequest(r.id))} testID={`request-cancel-${r.id}`}>
                <Text style={[styles.linkText, { color: semantic.destructive.fg }]}>Cancel request</Text>
              </Pressable>
            ) : null}
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: neutral.background },
  container: { padding: 16, paddingBottom: 40, gap: 10 },
  flex: { flex: 1 },
  card: { padding: 14, gap: 4 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 },
  iconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: accent.bg, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16.5, fontWeight: "700", color: neutral.text },
  name: { fontSize: 14.5, fontWeight: "700", color: neutral.text },
  meta: { fontSize: 12, color: neutral.textMuted },
  detail: { fontSize: 13, color: neutral.text, marginTop: 2 },
  empty: { textAlign: "center", color: neutral.textMuted, marginVertical: 16 },
  footnote: { fontSize: 11.5, color: neutral.textMuted, marginTop: 8 },
  sectionLabel: { fontSize: 12.5, color: accent.fg, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 10 },
  label: { fontSize: 12.5, color: accent.fg, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 14, marginBottom: 6 },
  flash: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginTop: 4 },
  input: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: neutral.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: neutral.text },
  dateInput: { marginTop: 8 },
  multiline: { minHeight: 76, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5, borderColor: neutral.border },
  chipSelected: { backgroundColor: accent.solid, borderColor: accent.solid },
  chipText: { color: "#333", fontSize: 13, fontWeight: "500" },
  chipTextSelected: { color: "#fff", fontWeight: "700" },
  primaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: accent.solid, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 18, marginTop: 14 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 14.5 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  linkButton: { alignSelf: "flex-start", paddingVertical: 6, marginTop: 4 },
  linkText: { color: accent.fg, fontWeight: "600", fontSize: 13 },
  reportRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: "700" },
  ask: { backgroundColor: semantic.warning.bg, borderRadius: 12, padding: 12, marginTop: 8, gap: 4 },
  askTitle: { fontSize: 12.5, fontWeight: "700", color: semantic.warning.fg },
  askText: { fontSize: 13, color: semantic.warning.fg, marginBottom: 6 },
  steps: { marginTop: 8, gap: 2, borderLeftWidth: 2, borderLeftColor: neutral.border, paddingLeft: 10 },
  stepAction: { fontWeight: "700", color: neutral.text },
});

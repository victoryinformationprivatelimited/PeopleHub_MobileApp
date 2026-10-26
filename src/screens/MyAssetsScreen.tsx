import { useCallback, useEffect, useState } from "react";
import {
  View, Text, Pressable, TextInput, StyleSheet, ScrollView, Modal, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Alert02Icon, CheckmarkCircle02Icon, LaptopIcon, PackageAddIcon, Wrench01Icon } from "@hugeicons/core-free-icons";
import type { RootStackParamList } from "../navigation/types";
import type { ApiResult } from "../api/client";
import { ISSUE_KINDS, type AssetIssueReport, type IssueKind, type MyAsset } from "../type/assets";
import { acknowledgeAsset, declineAsset, getMyAssets, getMyIssueReports, reportAssetIssue } from "../api/Assets/AssetsAPI";
import { neutral, semantic, moduleColor } from "../theme";
import { SkeletonScreen } from "../components/Skeleton";
import Card from "../components/Card";
import { daysUntil, fmtDate } from "./assetFormat";

const accent = moduleColor.profile;

type Props = NativeStackScreenProps<RootStackParamList, "MyAssets">;
type Flash = { tone: "success" | "error"; text: string } | null;

const ISSUE_LABEL: Record<IssueKind, string> = {
  Fault: "Not working properly",
  Damage: "Damaged",
  Lost: "I have lost it",
  Stolen: "It was stolen",
};

function Pill({ bg, fg, children }: { bg: string; fg: string; children: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{children}</Text>
    </View>
  );
}

function badges(a: MyAsset) {
  const out: { key: string; bg: string; fg: string; text: string }[] = [];
  if (a.acknowledgement === "Pending") out.push({ key: "ack", ...semantic.warning, text: "Please confirm you received this" });
  if (a.acknowledgement === "Declined") out.push({ key: "ack", ...semantic.destructive, text: "Declined, awaiting follow-up" });
  if (a.acknowledgement === "Acknowledged") out.push({ key: "ack", ...semantic.success, text: "Received" });
  if (a.expectedReturnDate) {
    const left = daysUntil(a.expectedReturnDate);
    if (left < 0) out.push({ key: "due", ...semantic.destructive, text: `Return overdue by ${-left} day${left === -1 ? "" : "s"}` });
    else if (left <= 7) out.push({ key: "due", ...semantic.warning, text: `Return due in ${left} day${left === 1 ? "" : "s"}` });
  }
  if (a.openReports > 0) out.push({ key: "rep", ...semantic.info, text: `${a.openReports} issue reported` });
  return out;
}

export default function MyAssetsScreen({ navigation }: Props) {
  const [assets, setAssets] = useState<MyAsset[] | null>(null);
  const [reports, setReports] = useState<AssetIssueReport[]>([]);
  const [flash, setFlash] = useState<Flash>(null);
  const [busy, setBusy] = useState(false);
  const [declining, setDeclining] = useState<MyAsset | null>(null);
  const [reporting, setReporting] = useState<MyAsset | null>(null);

  const load = useCallback(async () => {
    const [a, r] = await Promise.all([getMyAssets(), getMyIssueReports()]);
    setAssets(a.data ?? []);
    setReports(r.data ?? []);
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

  if (assets === null) return <SkeletonScreen />;

  const held = assets.filter((a) => a.status === "Active");
  const past = assets.filter((a) => a.status !== "Active");
  const toConfirm = held.filter((a) => a.acknowledgement === "Pending");
  const dueSoon = held.filter((a) => a.expectedReturnDate && daysUntil(a.expectedReturnDate) <= 7);

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconBadge}>
              <HugeiconsIcon icon={LaptopIcon} size={20} color={accent.fg} strokeWidth={1.8} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.title}>My assets</Text>
              <Text style={styles.meta}>Company equipment issued to you</Text>
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [styles.outlineButton, pressed && styles.pressed]}
            onPress={() => navigation.navigate("RequestAsset")}
            testID="my-assets-request"
          >
            <HugeiconsIcon icon={PackageAddIcon} size={16} color={accent.fg} strokeWidth={1.8} />
            <Text style={styles.outlineButtonText}>Request an asset</Text>
          </Pressable>

          {flash ? (
            <View
              accessibilityRole={flash.tone === "error" ? "alert" : undefined}
              style={[styles.flash, { backgroundColor: flash.tone === "success" ? semantic.success.bg : semantic.destructive.bg }]}
            >
              <Text style={{ color: flash.tone === "success" ? semantic.success.fg : semantic.destructive.fg, fontSize: 12.5 }}>{flash.text}</Text>
            </View>
          ) : null}

          <View style={styles.tiles}>
            {[
              { label: "Holding", value: held.length, warn: false },
              { label: "To confirm", value: toConfirm.length, warn: toConfirm.length > 0 },
              { label: "Due back soon", value: dueSoon.length, warn: dueSoon.length > 0 },
            ].map((t) => (
              <View key={t.label} style={styles.tile}>
                <Text style={[styles.tileValue, t.warn && { color: semantic.warning.fg }]}>{t.value}</Text>
                <Text style={styles.tileLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
        </Card>

        {toConfirm.length > 0 ? (
          <View style={styles.banner}>
            <HugeiconsIcon icon={Alert02Icon} size={17} color={semantic.warning.fg} strokeWidth={1.8} />
            <Text style={styles.bannerText}>
              You have {toConfirm.length} item{toConfirm.length > 1 ? "s" : ""} waiting for your confirmation. Please check what you were handed and confirm, or tell us if something is wrong.
            </Text>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>Currently with me</Text>
        {held.length === 0 ? <Text style={styles.empty}>Nothing is assigned to you right now.</Text> : null}
        {held.map((a) => (
          <Card key={a.assignmentId} style={styles.card}>
            <Text style={styles.name}>{a.name}</Text>
            <Text style={styles.meta}>{a.assetCode} · {a.category} · tag {a.assetTag}</Text>
            <View style={styles.pillRow}>
              {badges(a).map((b) => (
                <Pill key={b.key} bg={b.bg} fg={b.fg}>{b.text}</Pill>
              ))}
            </View>
            <Text style={styles.detail}>
              Issued {fmtDate(a.issueDate)} in {a.condition.toLowerCase()} condition{a.accessories ? ` with ${a.accessories}` : ""}.
              {a.expectedReturnDate ? ` Return by ${fmtDate(a.expectedReturnDate)}.` : ""}
            </Text>
            {a.acknowledgement === "Declined" && a.declineReason ? (
              <Text style={[styles.detail, { color: semantic.destructive.fg }]}>You said: {a.declineReason}</Text>
            ) : null}

            {a.acknowledgement === "Pending" ? (
              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                  disabled={busy}
                  onPress={() => run(acknowledgeAsset(a.assignmentId))}
                  testID={`asset-ack-${a.assignmentId}`}
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="#fff" strokeWidth={1.8} />
                  <Text style={styles.primaryButtonText}>I have received this</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.outlineButton, styles.grow, pressed && styles.pressed]}
                  disabled={busy}
                  onPress={() => setDeclining(a)}
                  testID={`asset-decline-${a.assignmentId}`}
                >
                  <Text style={styles.outlineButtonText}>Something is wrong</Text>
                </Pressable>
              </View>
            ) : null}
            <Pressable style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]} onPress={() => setReporting(a)} testID={`asset-report-${a.assignmentId}`}>
              <HugeiconsIcon icon={Wrench01Icon} size={15} color={accent.fg} strokeWidth={1.8} />
              <Text style={styles.linkText}>Report a problem</Text>
            </Pressable>
          </Card>
        ))}

        {reports.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Problems I have reported</Text>
            <Card style={styles.card}>
              {reports.map((r, i) => (
                <View key={r.id} style={[styles.reportRow, i > 0 && styles.reportDivider]}>
                  <View style={styles.flex}>
                    <Text style={styles.reportTitle}>{r.kind}: {r.assetName}</Text>
                    <Text style={styles.meta}>{r.description} · {fmtDate(r.reportedOn)}</Text>
                  </View>
                  <Pill {...(r.status === "Resolved" ? semantic.success : r.status === "In progress" ? semantic.info : semantic.warning)}>{r.status}</Pill>
                </View>
              ))}
            </Card>
          </>
        ) : null}

        {past.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Previously held</Text>
            <Card style={styles.card}>
              {past.map((a, i) => (
                <View key={a.assignmentId} style={[styles.reportRow, i > 0 && styles.reportDivider]}>
                  <View style={styles.flex}>
                    <Text style={styles.reportTitle}>{a.name}</Text>
                    <Text style={styles.meta}>{a.assetCode} · {fmtDate(a.issueDate)} to {fmtDate(a.closedOn)}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </>
        ) : null}
      </ScrollView>

      {declining ? (
        <DeclineModal asset={declining} busy={busy} onClose={() => setDeclining(null)} onSubmit={(reason) => run(declineAsset(declining.assignmentId, reason), () => setDeclining(null))} />
      ) : null}
      {reporting ? (
        <ReportModal
          asset={reporting}
          busy={busy}
          onClose={() => setReporting(null)}
          onSubmit={(kind, description) => run(reportAssetIssue({ assignmentId: reporting.assignmentId, kind, description }), () => setReporting(null))}
        />
      ) : null}
    </>
  );
}

function SheetModal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={styles.flex} onPress={onClose} accessibilityLabel="Close" />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.meta}>{subtitle}</Text>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function DeclineModal({ asset, busy, onClose, onSubmit }: { asset: MyAsset; busy: boolean; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <SheetModal title="What is wrong?" subtitle={`${asset.name} (${asset.assetCode}). Nothing is taken back until the asset team has spoken to you.`} onClose={onClose}>
      <Text style={styles.fieldLabel}>Reason</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={reason}
        onChangeText={setReason}
        multiline
        placeholder="For example: the charger was missing"
        accessibilityLabel="Reason"
        testID="decline-reason"
      />
      <View style={styles.actionRow}>
        <Pressable style={({ pressed }) => [styles.outlineButton, styles.grow, pressed && styles.pressed]} onPress={onClose}>
          <Text style={styles.outlineButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, (busy || !reason.trim()) && styles.disabled, pressed && styles.pressed]}
          disabled={busy || !reason.trim()}
          onPress={() => onSubmit(reason)}
          testID="decline-submit"
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Send</Text>}
        </Pressable>
      </View>
    </SheetModal>
  );
}

function ReportModal({ asset, busy, onClose, onSubmit }: { asset: MyAsset; busy: boolean; onClose: () => void; onSubmit: (kind: IssueKind, description: string) => void }) {
  const [kind, setKind] = useState<IssueKind>("Fault");
  const [description, setDescription] = useState("");
  const serious = kind === "Lost" || kind === "Stolen";
  return (
    <SheetModal title="Report a problem" subtitle={`${asset.name} (${asset.assetCode})`} onClose={onClose}>
      <Text style={styles.fieldLabel}>What happened?</Text>
      <View style={styles.chipRow}>
        {ISSUE_KINDS.map((k) => (
          <Pressable key={k} style={[styles.chip, kind === k && styles.chipSelected]} onPress={() => setKind(k)} accessibilityState={{ selected: kind === k }}>
            <Text style={[styles.chipText, kind === k && styles.chipTextSelected]}>{ISSUE_LABEL[k]}</Text>
          </Pressable>
        ))}
      </View>
      {serious ? (
        <View style={[styles.banner, styles.noMargin]}>
          <HugeiconsIcon icon={Alert02Icon} size={16} color={semantic.warning.fg} strokeWidth={1.8} />
          <Text style={styles.bannerText}>Please also tell your manager. If it was stolen, include the police report number below.</Text>
        </View>
      ) : null}
      <Text style={styles.fieldLabel}>Details</Text>
      <TextInput style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} multiline accessibilityLabel="Details" testID="report-details" />
      <View style={styles.actionRow}>
        <Pressable style={({ pressed }) => [styles.outlineButton, styles.grow, pressed && styles.pressed]} onPress={onClose}>
          <Text style={styles.outlineButtonText}>Cancel</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, (busy || !description.trim()) && styles.disabled, pressed && styles.pressed]}
          disabled={busy || !description.trim()}
          onPress={() => onSubmit(kind, description)}
          testID="report-submit"
        >
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Submit report</Text>}
        </Pressable>
      </View>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: neutral.background },
  container: { padding: 16, paddingBottom: 32, gap: 10 },
  flex: { flex: 1 },
  grow: { flex: 1 },
  card: { padding: 14, gap: 6 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: accent.bg, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 16.5, fontWeight: "700", color: neutral.text },
  name: { fontSize: 14.5, fontWeight: "700", color: neutral.text },
  meta: { fontSize: 12, color: neutral.textMuted },
  detail: { fontSize: 12.5, color: neutral.textMuted, marginTop: 2 },
  empty: { textAlign: "center", color: neutral.textMuted, marginVertical: 16 },
  sectionLabel: { fontSize: 12.5, color: accent.fg, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 10 },
  tiles: { flexDirection: "row", gap: 8, marginTop: 6 },
  tile: { flex: 1, borderWidth: 1, borderColor: neutral.border, borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  tileValue: { fontSize: 21, fontWeight: "700", color: neutral.text },
  tileLabel: { fontSize: 11, color: neutral.textMuted, marginTop: 1 },
  flash: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, marginTop: 4 },
  banner: { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: semantic.warning.bg, borderRadius: 12, padding: 12 },
  noMargin: { marginTop: 4 },
  bannerText: { flex: 1, fontSize: 12.5, color: semantic.warning.fg },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: "700" },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  primaryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: accent.solid, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, flex: 1 },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13.5 },
  outlineButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 11, paddingHorizontal: 14, borderWidth: 1.5, borderColor: neutral.border, backgroundColor: "#fff", marginTop: 8 },
  outlineButtonText: { color: neutral.text, fontWeight: "600", fontSize: 13.5 },
  linkButton: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, alignSelf: "flex-start", paddingVertical: 4 },
  linkText: { color: accent.fg, fontWeight: "600", fontSize: 13 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  reportRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  reportDivider: { borderTopWidth: 1, borderTopColor: neutral.border },
  reportTitle: { fontSize: 13.5, fontWeight: "600", color: neutral.text },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, gap: 6, paddingBottom: 28 },
  sheetTitle: { fontSize: 16.5, fontWeight: "700", color: neutral.text },
  fieldLabel: { fontSize: 12.5, color: accent.fg, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: neutral.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: neutral.text },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1.5, borderColor: neutral.border },
  chipSelected: { backgroundColor: accent.solid, borderColor: accent.solid },
  chipText: { color: "#333", fontSize: 13, fontWeight: "500" },
  chipTextSelected: { color: "#fff", fontWeight: "700" },
});

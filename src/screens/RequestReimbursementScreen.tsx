import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, ActivityIndicator, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { PayPeriodReturn, RequestReimbursementReq } from "../type/payroll";
import { getMyPayPeriods, requestReimbursement } from "../api/Payroll/PayrollAPI";
import { moduleColor, semantic } from "../theme";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Camera01Icon, Delete02Icon } from "@hugeicons/core-free-icons";

const accent = moduleColor.payroll;

type Props = NativeStackScreenProps<RootStackParamList, "RequestReimbursement">;

const REIMBURSEMENT_TYPES: RequestReimbursementReq["reimbursementType"][] = [
  "Travel", "Medical", "Meals", "Communication", "Other",
];

export default function RequestReimbursementScreen({ navigation }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [payPeriods, setPayPeriods] = useState<PayPeriodReturn[]>([]);
  const [reimbursementType, setReimbursementType] = useState<RequestReimbursementReq["reimbursementType"]>("Travel");
  const [payPeriodId, setPayPeriodId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    getMyPayPeriods().then((res) => { if (res.success && res.data) setPayPeriods(res.data); });
  }, []);

  async function capturePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.5 });
    if (photo) {
      setPhotoUri(photo.uri);
      setShowCamera(false);
    }
  }

  async function submit() {
    const amountValue = Number(amount);
    if (!amountValue || amountValue <= 0) {
      setResult("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    setResult(null);
    const response = await requestReimbursement({
      reimbursementType,
      description: description || undefined,
      payPeriodId: payPeriodId ?? undefined,
      amount: amountValue,
      documentUri: photoUri ?? undefined,
    });
    setSubmitting(false);
    setResult(response.success ? "Submitted for approval." : response.message);
    if (response.success) setTimeout(() => navigation.goBack(), 1000);
  }

  if (showCamera) {
    if (!permission?.granted) {
      return (
        <View style={styles.center}>
          <View style={styles.permissionIconBadge}>
            <HugeiconsIcon icon={Camera01Icon} size={28} color={accent.fg} strokeWidth={1.6} />
          </View>
          <Text style={styles.info}>Camera access is needed to attach a receipt photo.</Text>
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.pressed]}
            onPress={requestPermission}
          >
            <HugeiconsIcon icon={Camera01Icon} size={17} color="#fff" strokeWidth={1.8} />
            <Text style={styles.buttonText}>Grant camera permission</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.pressed]}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View style={styles.controls}>
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.pressed]}
            onPress={capturePhoto}
            testID="capture-receipt-button"
          >
            <HugeiconsIcon icon={Camera01Icon} size={17} color="#fff" strokeWidth={1.8} />
            <Text style={styles.buttonText}>Take photo</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.pressed]}
            onPress={() => setShowCamera(false)}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <Text style={styles.label}>Type</Text>
      <View style={styles.chipRow}>
        {REIMBURSEMENT_TYPES.map((t) => (
          <Pressable
            key={t}
            style={[styles.chip, reimbursementType === t && styles.chipSelected]}
            onPress={() => setReimbursementType(t)}
          >
            <Text style={[styles.chipText, reimbursementType === t && styles.chipTextSelected]}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Amount</Text>
      <TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" />

      <Text style={styles.label}>Pay period (optional)</Text>
      <View style={styles.chipRow}>
        {payPeriods.map((p) => (
          <Pressable
            key={p.payPeriodId}
            style={[styles.chip, payPeriodId === p.payPeriodId && styles.chipSelected]}
            onPress={() => setPayPeriodId(payPeriodId === p.payPeriodId ? null : p.payPeriodId)}
          >
            <Text style={[styles.chipText, payPeriodId === p.payPeriodId && styles.chipTextSelected]}>{p.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Description (optional)</Text>
      <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" multiline />

      <Text style={styles.label}>Receipt (optional)</Text>
      {photoUri ? (
        <View>
          <Image source={{ uri: photoUri }} style={styles.preview} />
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.pressed]}
            onPress={() => setPhotoUri(null)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={16} color={semantic.destructive.fg} strokeWidth={1.8} />
            <Text style={[styles.secondaryButtonText, { color: semantic.destructive.fg }]}>Remove photo</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.pressed]}
          onPress={() => setShowCamera(true)}
          testID="attach-receipt-button"
        >
          <HugeiconsIcon icon={Camera01Icon} size={16} color={accent.fg} strokeWidth={1.8} />
          <Text style={styles.secondaryButtonText}>Attach receipt photo</Text>
        </Pressable>
      )}

      {result ? <Text style={styles.result}>{result}</Text> : null}

      <Pressable
        style={({ pressed }) => [styles.button, styles.submitButton, pressed && styles.pressed]}
        onPress={submit}
        disabled={submitting}
        testID="request-reimbursement-submit"
      >
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit for approval</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12, backgroundColor: "#f2f3f5" },
  permissionIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: accent.bg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  info: { textAlign: "center", marginBottom: 8, color: "#444" },
  controls: { padding: 16, gap: 10 },
  formContainer: { padding: 16, gap: 4, paddingBottom: 40 },
  label: { fontSize: 12.5, color: accent.fg, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.3, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "rgba(31,35,40,0.1)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1f2328",
  },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: "rgba(31,35,40,0.1)",
  },
  chipSelected: {
    backgroundColor: accent.solid,
    borderColor: accent.solid,
    shadowColor: accent.solid,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  chipText: { color: "#333", fontSize: 13, fontWeight: "500" },
  chipTextSelected: { color: "#fff", fontWeight: "700" },
  preview: { height: 180, borderRadius: 12, marginBottom: 8, backgroundColor: "#000" },
  pressed: { opacity: 0.85 },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24 },
  buttonPrimary: {
    backgroundColor: accent.solid,
    shadowColor: accent.solid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  buttonSecondary: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "rgba(31,35,40,0.1)" },
  secondaryButtonText: { color: "#333", fontWeight: "600", fontSize: 14 },
  result: { textAlign: "center", color: "#333", marginTop: 16 },
  submitButton: {
    backgroundColor: semantic.success.solid,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: semantic.success.solid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});

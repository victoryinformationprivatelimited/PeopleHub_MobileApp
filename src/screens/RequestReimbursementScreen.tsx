import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, TextInput, StyleSheet, ScrollView, ActivityIndicator, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { PayPeriodReturn, RequestReimbursementReq } from "../type/payroll";
import { getMyPayPeriods, requestReimbursement } from "../api/Payroll/PayrollAPI";
import { moduleColor, semantic } from "../theme";

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
          <Text style={styles.info}>Camera access is needed to attach a receipt photo.</Text>
          <Pressable style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant camera permission</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setShowCamera(false)}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
        <View style={styles.controls}>
          <Pressable style={styles.button} onPress={capturePhoto} testID="capture-receipt-button">
            <Text style={styles.buttonText}>Take photo</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => setShowCamera(false)}>
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
          <Pressable style={styles.secondaryButton} onPress={() => setPhotoUri(null)}>
            <Text style={styles.secondaryButtonText}>Remove photo</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.secondaryButton} onPress={() => setShowCamera(true)} testID="attach-receipt-button">
          <Text style={styles.secondaryButtonText}>Attach receipt photo</Text>
        </Pressable>
      )}

      {result ? <Text style={styles.result}>{result}</Text> : null}

      <Pressable style={styles.submitButton} onPress={submit} disabled={submitting} testID="request-reimbursement-submit">
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit for approval</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 10 },
  info: { textAlign: "center", marginBottom: 16, color: "#444" },
  controls: { padding: 16, gap: 10 },
  formContainer: { padding: 16, gap: 4 },
  label: { fontSize: 12, color: "#666", textTransform: "uppercase", marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: "#f1f3f5", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipSelected: { backgroundColor: accent.solid },
  chipText: { color: "#333", fontSize: 13 },
  chipTextSelected: { color: "#fff", fontWeight: "600" },
  preview: { height: 180, borderRadius: 8, marginBottom: 8, backgroundColor: "#000" },
  button: { backgroundColor: accent.solid, borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  secondaryButton: { backgroundColor: "#f1f3f5", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  secondaryButtonText: { color: "#333", fontWeight: "600" },
  result: { textAlign: "center", color: "#333", marginTop: 16 },
  submitButton: { backgroundColor: semantic.success.solid, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 20, marginBottom: 40 },
  submitButtonText: { color: "#fff", fontWeight: "600" },
});

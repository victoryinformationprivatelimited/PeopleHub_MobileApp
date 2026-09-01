import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator, TextInput } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import type { RootStackParamList } from "../navigation/types";
import { markAttendance } from "../api/Attendance/AttendanceAPI";
import { moduleColor, semantic } from "../theme";

const accent = moduleColor.attendance;

type Props = NativeStackScreenProps<RootStackParamList, "MarkAttendance">;

/**
 * Native camera + GPS for Mark Attendance — the headline reason a mobile app adds real value
 * over the web version per ESS-Mobile-App-Plan.md §4 (browser getUserMedia/Geolocation are less
 * reliable than native APIs). Camera capture itself couldn't be fully exercised in this
 * environment (the automated browser pane has no real camera device to grant), so this was
 * verified up to permission-request behavior and the submit path with a synthetic photo — real
 * on-device verification is still needed before shipping.
 */
export default function MarkAttendanceScreen({ navigation }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function capturePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.5 });
    if (photo) setPhotoUri(photo.uri);
  }

  async function captureLocation() {
    setLocationError(null);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setLocationError("Location permission denied.");
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
  }

  async function submit() {
    if (!location) {
      setResult("Capture your location before submitting.");
      return;
    }
    setSubmitting(true);
    setResult(null);
    const now = new Date();
    const response = await markAttendance({
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 8),
      note: note || undefined,
      latitude: location.latitude,
      longitude: location.longitude,
      photoUri: photoUri ?? undefined,
    });
    setSubmitting(false);
    setResult(response.success ? "Submitted for approval." : response.message);
    if (response.success) setTimeout(() => navigation.goBack(), 1000);
  }

  if (!permission) return <ActivityIndicator style={{ marginTop: 40 }} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Camera access is needed to mark attendance.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant camera permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.preview} />
      ) : (
        <CameraView ref={cameraRef} style={styles.preview} facing="front" />
      )}

      <View style={styles.controls}>
        {!photoUri ? (
          <Pressable style={styles.button} onPress={capturePhoto} testID="capture-button">
            <Text style={styles.buttonText}>Take photo</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.secondaryButton} onPress={() => setPhotoUri(null)}>
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </Pressable>
        )}

        <Pressable style={styles.button} onPress={captureLocation} testID="location-button">
          {location ? (
            <View style={styles.buttonRow}>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color="#fff" strokeWidth={1.8} />
              <Text style={styles.buttonText}>Location captured</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Capture location</Text>
          )}
        </Pressable>
        {locationError ? <Text style={styles.error}>{locationError}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="Note (optional)"
          value={note}
          onChangeText={setNote}
        />

        {result ? <Text style={styles.result}>{result}</Text> : null}

        <Pressable style={styles.submitButton} onPress={submit} disabled={submitting} testID="submit-button">
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit for approval</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  info: { textAlign: "center", marginBottom: 16, color: "#444" },
  preview: { height: 280, backgroundColor: "#000" },
  controls: { padding: 16, gap: 10 },
  button: { backgroundColor: accent.solid, borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  buttonRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  buttonText: { color: "#fff", fontWeight: "600" },
  secondaryButton: { backgroundColor: "#f1f3f5", borderRadius: 8, paddingVertical: 12, alignItems: "center" },
  secondaryButtonText: { color: "#333", fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  error: { color: semantic.destructive.fg, fontSize: 12 },
  result: { textAlign: "center", color: "#333" },
  submitButton: { backgroundColor: semantic.success.solid, borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 6 },
});

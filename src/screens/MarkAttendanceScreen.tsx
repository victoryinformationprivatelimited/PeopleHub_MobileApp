import { useRef, useState } from "react";
import { View, Text, Pressable, StyleSheet, Image, ActivityIndicator, TextInput } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Location from "expo-location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { CheckmarkCircle02Icon, Camera01Icon, Location01Icon, RefreshIcon, Note01Icon } from "@hugeicons/core-free-icons";
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
        <View style={styles.permissionIconBadge}>
          <HugeiconsIcon icon={Camera01Icon} size={30} color={accent.fg} strokeWidth={1.6} />
        </View>
        <Text style={styles.infoTitle}>Camera access needed</Text>
        <Text style={styles.info}>We use your camera to take a quick photo when you mark attendance.</Text>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonPrimary,
            styles.permissionButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={requestPermission}
        >
          <HugeiconsIcon icon={Camera01Icon} size={17} color="#fff" strokeWidth={1.8} />
          <Text style={styles.buttonText}>Grant camera permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.previewWrap}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.preview} />
        ) : (
          <CameraView ref={cameraRef} style={styles.preview} facing="front" />
        )}
      </View>

      <View style={styles.controls}>
        {!photoUri ? (
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.buttonPressed]}
            onPress={capturePhoto}
            testID="capture-button"
          >
            <HugeiconsIcon icon={Camera01Icon} size={17} color="#fff" strokeWidth={1.8} />
            <Text style={styles.buttonText}>Take photo</Text>
          </Pressable>
        ) : (
          <Pressable
            style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.buttonPressed]}
            onPress={() => setPhotoUri(null)}
          >
            <HugeiconsIcon icon={RefreshIcon} size={16} color={accent.fg} strokeWidth={1.8} />
            <Text style={styles.secondaryButtonText}>Retake</Text>
          </Pressable>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.button,
            location ? styles.buttonSuccess : styles.buttonPrimary,
            pressed && styles.buttonPressed,
          ]}
          onPress={captureLocation}
          testID="location-button"
        >
          <HugeiconsIcon
            icon={location ? CheckmarkCircle02Icon : Location01Icon}
            size={17}
            color="#fff"
            strokeWidth={1.8}
          />
          <Text style={styles.buttonText}>{location ? "Location captured" : "Capture location"}</Text>
        </Pressable>
        {locationError ? <Text style={styles.error}>{locationError}</Text> : null}

        <View style={styles.inputRow}>
          <HugeiconsIcon icon={Note01Icon} size={18} color="#8a8f98" strokeWidth={1.8} />
          <TextInput
            style={styles.input}
            placeholder="Note (optional)"
            placeholderTextColor="#8a8f98"
            value={note}
            onChangeText={setNote}
          />
        </View>

        {result ? <Text style={styles.result}>{result}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.button, styles.submitButton, pressed && styles.buttonPressed]}
          onPress={submit}
          disabled={submitting}
          testID="submit-button"
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit for approval</Text>}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f2f3f5" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, backgroundColor: "#f2f3f5" },
  permissionIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: accent.bg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  infoTitle: { fontSize: 17, fontWeight: "700", color: "#1f2328", marginBottom: 6 },
  info: { textAlign: "center", marginBottom: 22, color: "#666", fontSize: 14, lineHeight: 20 },
  permissionButton: { paddingHorizontal: 24 },
  previewWrap: { backgroundColor: "#000" },
  preview: { height: 320 },
  controls: { padding: 16, gap: 12, marginTop: -20, backgroundColor: "#f2f3f5", borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  buttonPressed: { opacity: 0.85 },
  buttonPrimary: {
    backgroundColor: accent.solid,
    shadowColor: accent.solid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonSuccess: {
    backgroundColor: semantic.success.solid,
    shadowColor: semantic.success.solid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  buttonSecondary: { backgroundColor: "#fff", borderWidth: 1.5, borderColor: "rgba(31,35,40,0.1)" },
  secondaryButtonText: { color: accent.fg, fontWeight: "600", fontSize: 15 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(31,35,40,0.1)",
    paddingHorizontal: 14,
  },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: "#1f2328" },
  error: { color: semantic.destructive.fg, fontSize: 12 },
  result: { textAlign: "center", color: "#333" },
  submitButton: {
    backgroundColor: semantic.success.solid,
    marginTop: 4,
    shadowColor: semantic.success.solid,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
});

import { View, Text, Pressable, StyleSheet } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Pressable style={styles.tile} onPress={() => navigation.navigate("ProfileList")} testID="home-profile-button">
        <Text style={styles.tileText}>Profile</Text>
      </Pressable>
      <Pressable style={styles.tile} onPress={() => navigation.navigate("AttendanceHome")} testID="home-attendance-button">
        <Text style={styles.tileText}>Attendance & Roster</Text>
      </Pressable>
      <Pressable style={styles.tile} onPress={() => navigation.navigate("LeaveHome")} testID="home-leave-button">
        <Text style={styles.tileText}>Leave</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  tile: { backgroundColor: "#f8f9fa", borderRadius: 12, padding: 20 },
  tileText: { fontSize: 17, fontWeight: "600", color: "#111" },
});

import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { brand } from "../theme";

/** The teal hero block used at the top of Home/Payroll/Profile in the Figma design — a
 * brand.solid → brand.dark2 gradient rather than a flat fill. */
export default function GradientHeader({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <LinearGradient colors={brand.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.gradient, style]}>
      <View>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
});

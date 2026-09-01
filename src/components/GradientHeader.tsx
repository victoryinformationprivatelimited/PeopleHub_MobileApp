import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { tokens } from "../theme/tokens";

/** The green hero block used at the top of Home/Payroll/Profile, ported from PeopleHub-ESS's
 * AuthLayout panel gradient (brandC → brandB → dark green). */
export default function GradientHeader({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <LinearGradient
      colors={[tokens.brandC, tokens.brandB, tokens.brandA]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, style]}
    >
      <View>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
});

import type { ReactNode } from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { neutral } from "../theme";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Flat solid card matching PeopleHub-ESS's actual portal look (bg-[var(--card)],
 * border-[var(--border)], shadow-[var(--shadow-card)]) — no blur/translucency.
 * Was briefly a glassmorphism BlurView card; reverted per direct feedback that
 * the app should match the portal's flat design, not glass.
 */
export default function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: neutral.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: neutral.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
});

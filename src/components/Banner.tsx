import { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, Pressable, Platform } from "react-native";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { TriangleAlertIcon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { semantic } from "../theme";

export type BannerVariant = "destructive" | "warning" | "info";

interface BannerProps {
  message: string | null;
  variant?: BannerVariant;
  onDismiss?: () => void;
}

const ICONS: Record<BannerVariant, typeof TriangleAlertIcon> = {
  destructive: TriangleAlertIcon,
  warning: TriangleAlertIcon,
  info: InformationCircleIcon,
};

/**
 * Flat status banner matching PeopleHub-ESS's inline login error chip
 * (bg-[var(--destructive-bg)] / text-[var(--destructive-fg)]) — solid
 * color, no blur. Floats as a top overlay/toast on mobile since there's
 * no fixed spot above the form the way ESS's web layout has one.
 */
export default function Banner({ message, variant = "destructive", onDismiss }: BannerProps) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -80, duration: 180, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    }
  }, [message]);

  if (!message) return null;

  const tone = semantic[variant === "destructive" ? "destructive" : variant === "warning" ? "warning" : "info"];

  return (
    <Animated.View
      style={[styles.wrapper, { transform: [{ translateY }], opacity }]}
      pointerEvents={message ? "box-none" : "none"}
    >
      <Pressable
        onPress={onDismiss}
        style={[styles.banner, { backgroundColor: tone.bg, borderColor: tone.fg + "33" }]}
      >
        <HugeiconsIcon icon={ICONS[variant]} size={17} color={tone.fg} strokeWidth={1.8} style={styles.icon} />
        <Text style={[styles.message, { color: tone.fg }]}>{message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: Platform.select({ ios: 56, android: 32, default: 24 }),
    left: 16,
    right: 16,
    zIndex: 50,
  },
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: { marginTop: 1 },
  message: { flex: 1, fontSize: 13.5, lineHeight: 18, fontWeight: "500" },
});

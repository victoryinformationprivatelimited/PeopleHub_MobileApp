import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { neutral } from "../theme";

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/** A single pulsing placeholder block. Compose several into a *SkeletonLayout below
 * to sketch out a screen's shape while its real data is still loading. */
export function Skeleton({ width = "100%", height = 14, borderRadius = 6, style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 650, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return <Animated.View style={[{ width, height, borderRadius, backgroundColor: neutral.border, opacity }, style]} />;
}

/** A generic "card full of lines" skeleton — matches the loading shape of most of this app's
 * screens (a heading line + a few body lines), so screens don't need bespoke skeleton layouts. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <View style={styles.card}>
      <Skeleton width="50%" height={13} style={{ marginBottom: 12 }} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? "70%" : "100%"} height={12} style={{ marginBottom: 8 }} />
      ))}
    </View>
  );
}

/** Full-screen skeleton — a stack of SkeletonCards, used for screens whose loading state
 * is a simple list/detail view rather than something with its own hero header. */
export function SkeletonScreen({ cards = 3 }: { cards?: number }) {
  return (
    <View style={styles.screen}>
      {Array.from({ length: cards }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 16, gap: 12 },
  card: {
    backgroundColor: neutral.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: neutral.border,
    padding: 16,
  },
});

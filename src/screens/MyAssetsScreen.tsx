import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { SkeletonScreen } from "../components/Skeleton";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HugeiconsIcon } from "@hugeicons/react-native";
import { Package01Icon } from "@hugeicons/core-free-icons";
import type { RootStackParamList } from "../navigation/types";
import type { AssetItem, AssetStatus } from "../type/assets";
import { getMyAssets } from "../api/Assets/AssetsAPI";
import { neutral, semantic, moduleColor } from "../theme";
import Card from "../components/Card";

const accent = moduleColor.profile;

const statusStyle: Record<AssetStatus, { bg: string; fg: string }> = {
  Assigned: semantic.success,
  Returned: { bg: neutral.background, fg: neutral.textMuted },
  "Under Repair": semantic.warning,
};

type Props = NativeStackScreenProps<RootStackParamList, "MyAssets">;

export default function MyAssetsScreen({}: Props) {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyAssets().then((result) => {
      if (result.success && result.data) setItems(result.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <SkeletonScreen />;

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.container}
      data={items}
      keyExtractor={(item) => String(item.assetId)}
      ListEmptyComponent={<Text style={styles.empty}>No assets assigned to you yet.</Text>}
      renderItem={({ item }) => {
        const tint = statusStyle[item.status];
        return (
          <Card style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconBadge}>
                <HugeiconsIcon icon={Package01Icon} size={19} color={accent.fg} strokeWidth={1.8} />
              </View>
              <View style={styles.body}>
                <Text style={styles.name}>{item.assetName}</Text>
                <Text style={styles.meta}>{item.category} · {item.assetTag}</Text>
                <Text style={styles.meta}>Assigned: {item.assignedDate}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: tint.bg }]}>
                <Text style={[styles.statusText, { color: tint.fg }]}>{item.status}</Text>
              </View>
            </View>
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: neutral.background },
  container: { padding: 16, paddingBottom: 28, gap: 10 },
  empty: { textAlign: "center", color: neutral.textMuted, marginTop: 24 },
  card: { padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBadge: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: accent.bg,
    alignItems: "center", justifyContent: "center",
  },
  body: { flex: 1 },
  name: { fontSize: 14.5, fontWeight: "700", color: neutral.text },
  meta: { fontSize: 12, color: neutral.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
});

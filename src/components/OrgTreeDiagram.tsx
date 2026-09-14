import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import Svg, { Path } from "react-native-svg";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import { CrownIcon, ZoomInAreaIcon, ZoomOutAreaIcon } from "@hugeicons/core-free-icons";
import { brand, neutral, semantic } from "../theme";
import type { TreeNode } from "../type/orgHierarchy";

/**
 * Canvas org-chart — the mobile equivalent of ESS's NodeDiagram.tsx (built there on
 * react-organizational-chart, which has no React Native port). Lays the tree out itself:
 * leaves get one slot each, a parent centers above its children, depth maps to a row. Panning
 * is a plain ScrollView (both axes); zoom is a few preset scale steps rather than pinch, which
 * needs a gesture-handler dependency this app doesn't have yet.
 */

const NODE_W = 148;
const NODE_H = 74;
const H_GAP = 20;
const LEVEL_H = 116;
const ZOOM_STEPS = [0.6, 0.8, 1, 1.25, 1.5];

interface LaidOutNode<T> {
  id: number;
  x: number;
  y: number;
  depth: number;
  data: T;
  hasChildren: boolean;
}

interface Edge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function layout<T>(tree: TreeNode<T>[], getId: (item: T) => number) {
  const nodes: LaidOutNode<T>[] = [];
  const edges: Edge[] = [];
  let cursor = 0;

  function place(node: TreeNode<T>, depth: number): number {
    if (node.children.length === 0) {
      const x = cursor * (NODE_W + H_GAP) + NODE_W / 2;
      cursor += 1;
      nodes.push({ id: getId(node.data), x, y: depth * LEVEL_H, depth, data: node.data, hasChildren: false });
      return x;
    }
    const childXs = node.children.map((child) => place(child, depth + 1));
    const x = (childXs[0] + childXs[childXs.length - 1]) / 2;
    const y = depth * LEVEL_H;
    nodes.push({ id: getId(node.data), x, y, depth, data: node.data, hasChildren: true });
    for (const childX of childXs) {
      const midY = y + NODE_H + (LEVEL_H - NODE_H) / 2;
      edges.push({ x1: x, y1: y + NODE_H, x2: childX, y2: midY });
    }
    return x;
  }

  tree.forEach((root) => place(root, 0));

  const width = Math.max(cursor * (NODE_W + H_GAP), NODE_W);
  const maxDepth = nodes.reduce((max, n) => Math.max(max, n.depth), 0);
  const height = (maxDepth + 1) * LEVEL_H;
  return { nodes, edges, width, height };
}

/** Right-angle elbow connector, same visual convention as react-organizational-chart's default
 * line style in ESS's NodeDiagram. */
function elbowPath(edge: Edge): string {
  const midY = (edge.y1 + edge.y2) / 2;
  return `M ${edge.x1} ${edge.y1} L ${edge.x1} ${midY} L ${edge.x2} ${midY} L ${edge.x2} ${edge.y2}`;
}

export interface OrgTreeDiagramProps<T> {
  tree: TreeNode<T>[];
  getId: (item: T) => number;
  getIcon: (item: T, depth: number) => IconSvgElement;
  getLabel: (item: T) => string;
  getCaption?: (item: T) => string | null | undefined;
  getHead?: (item: T) => { name: string; designation?: string | null } | null | undefined;
  isCurrent?: (item: T) => boolean;
}

const DEPTH_ICON_BG = [brand.dark1, brand.solid, brand.light1, brand.light2];

export default function OrgTreeDiagram<T>(props: OrgTreeDiagramProps<T>) {
  const [zoomIndex, setZoomIndex] = useState(2);
  const scale = ZOOM_STEPS[zoomIndex];
  const { nodes, edges, width, height } = useMemo(
    () => layout(props.tree, props.getId),
    [props.tree, props.getId],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.zoomBar}>
        <Pressable
          style={styles.zoomButton}
          disabled={zoomIndex === 0}
          onPress={() => setZoomIndex((i) => Math.max(0, i - 1))}
          testID="org-zoom-out"
        >
          <HugeiconsIcon icon={ZoomOutAreaIcon} size={18} color={zoomIndex === 0 ? "#c3c8cf" : brand.dark1} strokeWidth={1.8} />
        </Pressable>
        <Text style={styles.zoomLabel}>{Math.round(scale * 100)}%</Text>
        <Pressable
          style={styles.zoomButton}
          disabled={zoomIndex === ZOOM_STEPS.length - 1}
          onPress={() => setZoomIndex((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))}
          testID="org-zoom-in"
        >
          <HugeiconsIcon
            icon={ZoomInAreaIcon}
            size={18}
            color={zoomIndex === ZOOM_STEPS.length - 1 ? "#c3c8cf" : brand.dark1}
            strokeWidth={1.8}
          />
        </Pressable>
      </View>

      <ScrollView horizontal contentContainerStyle={{ width: width * scale + 32 }}>
        <ScrollView contentContainerStyle={{ height: height * scale + 32, width: width * scale + 32 }}>
          <View style={[styles.canvas, { width, height, transform: [{ scale }] }]}>
            <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
              {edges.map((edge, i) => (
                <Path key={i} d={elbowPath(edge)} stroke={neutral.border} strokeWidth={2} fill="none" />
              ))}
            </Svg>

            {nodes.map((node) => {
              const current = props.isCurrent?.(node.data) ?? false;
              const head = props.getHead?.(node.data);
              const caption = props.getCaption?.(node.data);
              return (
                <View
                  key={node.id}
                  style={[
                    styles.node,
                    { left: node.x - NODE_W / 2, top: node.y, width: NODE_W },
                    current && styles.nodeCurrent,
                  ]}
                >
                  {current ? (
                    <View style={styles.currentPill}>
                      <Text style={styles.currentPillText}>You are here</Text>
                    </View>
                  ) : null}
                  <View style={[styles.iconBadge, { backgroundColor: DEPTH_ICON_BG[node.depth % DEPTH_ICON_BG.length] }]}>
                    <HugeiconsIcon icon={props.getIcon(node.data, node.depth)} size={15} color="#fff" strokeWidth={1.8} />
                  </View>
                  <Text style={styles.label} numberOfLines={1}>{props.getLabel(node.data)}</Text>
                  {caption ? <Text style={styles.caption} numberOfLines={1}>{caption}</Text> : null}
                  {head?.name ? (
                    <View style={styles.headRow}>
                      <HugeiconsIcon icon={CrownIcon} size={11} color={semantic.warning.fg} strokeWidth={1.8} />
                      <Text style={styles.headText} numberOfLines={1}>{head.name}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  zoomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 8,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: neutral.border,
  },
  zoomButton: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: neutral.background,
    alignItems: "center", justifyContent: "center",
  },
  zoomLabel: { fontSize: 12.5, color: neutral.textMuted, fontWeight: "600", minWidth: 40, textAlign: "center" },
  canvas: { position: "relative" },
  node: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: neutral.border,
    padding: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  nodeCurrent: { borderColor: semantic.warning.solid, borderWidth: 1.5 },
  currentPill: {
    position: "absolute",
    top: -10,
    backgroundColor: semantic.warning.bg,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  currentPillText: { fontSize: 9, fontWeight: "700", color: semantic.warning.fg },
  iconBadge: {
    width: 26, height: 26, borderRadius: 13,
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  label: { fontSize: 12.5, fontWeight: "700", color: neutral.text, textAlign: "center" },
  caption: { fontSize: 10.5, color: neutral.textMuted, marginTop: 1, textAlign: "center" },
  headRow: {
    flexDirection: "row", alignItems: "center", gap: 4,
    marginTop: 6, paddingTop: 6,
    borderTopWidth: 1, borderTopColor: neutral.border,
    width: "100%", justifyContent: "center",
  },
  headText: { fontSize: 10, color: neutral.text, fontWeight: "600", flexShrink: 1 },
});

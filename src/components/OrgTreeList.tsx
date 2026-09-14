import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react-native";
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  CrownIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { brand, neutral, semantic } from "../theme";
import type { TreeNode, UnitEmployee } from "../type/orgHierarchy";

/**
 * Indented, collapsible tree list — the mobile equivalent of ESS's OrgTree "List view"
 * (src/modules/Organization/OrgTree.tsx). ESS also has a canvas org-chart "Tree view"
 * (NodeDiagram.tsx, built on react-organizational-chart), which has no React Native
 * equivalent; this list view is the practical port for a phone screen.
 *
 * ESS colors each node by entity type / role level (a multi-hue gradient palette). This
 * app deliberately uses one consistent brand green everywhere instead of a color per
 * section (see theme.ts's moduleColor comment) — so depth is conveyed via icon shade,
 * not hue, to stay consistent with the rest of the app.
 */

const DEPTH_ICON_BG = [brand.dark1, brand.solid, brand.light1, brand.light2];

export interface OrgTreeListProps<T> {
  tree: TreeNode<T>[];
  getId: (item: T) => number;
  getIcon: (item: T, depth: number) => IconSvgElement;
  getLabel: (item: T) => string;
  getCaption?: (item: T) => string | null | undefined;
  getHead?: (item: T) => { name: string; designation?: string | null } | null | undefined;
  getEmployees?: (item: T) => UnitEmployee[] | undefined;
  isCurrent?: (item: T) => boolean;
}

export default function OrgTreeList<T>(props: OrgTreeListProps<T>) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expandedRosters, setExpandedRosters] = useState<Set<string>>(new Set());

  function toggleCollapsed(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleRoster(key: string) {
    setExpandedRosters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function renderNode(node: TreeNode<T>, depth: number): React.ReactNode {
    const id = props.getId(node.data);
    const key = `node-${id}`;
    const hasChildren = node.children.length > 0;
    const isCollapsed = collapsed.has(key);
    const head = props.getHead?.(node.data);
    const employees = props.getEmployees?.(node.data) ?? [];
    const rosterExpanded = expandedRosters.has(key);
    const current = props.isCurrent?.(node.data) ?? false;
    const caption = props.getCaption?.(node.data);

    return (
      <View key={key} style={{ marginLeft: depth * 16 }}>
        <View style={[styles.card, current && styles.cardCurrent]}>
          <View style={styles.row}>
            {hasChildren ? (
              <Pressable hitSlop={8} onPress={() => toggleCollapsed(key)} testID={`org-toggle-${id}`}>
                <HugeiconsIcon
                  icon={isCollapsed ? ArrowRight01Icon : ArrowDown01Icon}
                  size={16}
                  color={neutral.textMuted}
                  strokeWidth={2}
                />
              </Pressable>
            ) : (
              <View style={{ width: 16 }} />
            )}
            <View style={[styles.iconBadge, { backgroundColor: DEPTH_ICON_BG[depth % DEPTH_ICON_BG.length] }]}>
              <HugeiconsIcon icon={props.getIcon(node.data, depth)} size={16} color="#fff" strokeWidth={1.8} />
            </View>
            <View style={styles.labelBlock}>
              <View style={styles.labelRow}>
                <Text style={styles.label} numberOfLines={1}>{props.getLabel(node.data)}</Text>
                {current ? (
                  <View style={styles.currentPill}>
                    <Text style={styles.currentPillText}>You are here</Text>
                  </View>
                ) : null}
              </View>
              {caption ? <Text style={styles.caption} numberOfLines={1}>{caption}</Text> : null}
            </View>
          </View>

          {head?.name ? (
            <View style={styles.headRow}>
              <View style={styles.headIconBadge}>
                <HugeiconsIcon icon={CrownIcon} size={13} color={semantic.warning.fg} strokeWidth={1.8} />
              </View>
              <Text style={styles.headText} numberOfLines={1}>
                {head.name}{head.designation ? ` · ${head.designation}` : ""}
              </Text>
            </View>
          ) : null}

          {employees.length > 0 ? (
            <Pressable onPress={() => toggleRoster(key)} style={styles.rosterToggle} testID={`org-roster-${id}`}>
              <HugeiconsIcon icon={UserMultiple02Icon} size={13} color={brand.dark1} strokeWidth={1.8} />
              <Text style={styles.rosterToggleText}>
                {employees.length} employee{employees.length === 1 ? "" : "s"}
              </Text>
              <HugeiconsIcon
                icon={rosterExpanded ? ArrowDown01Icon : ArrowRight01Icon}
                size={13}
                color={brand.dark1}
                strokeWidth={2}
              />
            </Pressable>
          ) : null}
          {rosterExpanded
            ? employees.map((e) => (
                <View key={e.employeeId} style={styles.rosterRow}>
                  <Text style={styles.rosterName} numberOfLines={1}>{e.employeeName}</Text>
                  <Text style={styles.rosterRole} numberOfLines={1}>{e.roleName}</Text>
                </View>
              ))
            : null}
        </View>

        {!isCollapsed && hasChildren ? node.children.map((child) => renderNode(child, depth + 1)) : null}
      </View>
    );
  }

  return <View>{props.tree.map((root) => renderNode(root, 0))}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: neutral.border,
    padding: 12,
    marginBottom: 8,
  },
  cardCurrent: { borderColor: semantic.warning.solid, borderWidth: 1.5 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBadge: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
  },
  labelBlock: { flex: 1 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontSize: 14.5, fontWeight: "700", color: neutral.text, flexShrink: 1 },
  caption: { fontSize: 12, color: neutral.textMuted, marginTop: 1 },
  currentPill: {
    backgroundColor: semantic.warning.bg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  currentPillText: { fontSize: 10.5, fontWeight: "700", color: semantic.warning.fg },
  headRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: neutral.border,
  },
  headIconBadge: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: semantic.warning.bg,
    alignItems: "center", justifyContent: "center",
  },
  headText: { fontSize: 12.5, color: neutral.text, flexShrink: 1, fontWeight: "600" },
  rosterToggle: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: neutral.border,
  },
  rosterToggleText: { fontSize: 12.5, color: brand.dark1, fontWeight: "600", flex: 1 },
  rosterRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 6, paddingLeft: 22,
  },
  rosterName: { fontSize: 12.5, color: neutral.text, flexShrink: 1 },
  rosterRole: { fontSize: 11.5, color: neutral.textMuted, marginLeft: 8 },
});

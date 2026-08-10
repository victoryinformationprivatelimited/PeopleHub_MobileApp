/**
 * Ported from the PeopleHub Mobile App UI Figma Make design
 * (figma.com/make/fIq8xc8buuDJR3pp02otf3, "Update color scheme to blue" — Version 3), which the
 * team designed as the real target look for this app. Single cyan/teal brand instead of the
 * per-module rainbow this file used before — one identity, used consistently everywhere.
 */

export const brand = {
  solid: "#00bcd4",
  light1: "#26c6da",
  light2: "#4dd0e1",
  dark1: "#00acc1",
  dark2: "#0097a7",
  /** Hero/header gradient endpoints, matching the mockup's Home/Payroll/Profile hero blocks. */
  gradient: ["#00bcd4", "#0097a7"] as const,
};

export const neutral = {
  background: "#f5f7fa",
  card: "#ffffff",
  text: "#14181f",
  textMuted: "#717182",
  textFaint: "#9a99a6",
  border: "rgba(0,0,0,0.08)",
};

/** Semantic tile pairs, unchanged in meaning from before — status colors stay status colors
 * regardless of brand hue, since red-for-destructive/green-for-success are universal, not brand. */
export const semantic = {
  info: { bg: "#e6f1fb", fg: "#185fa5", solid: "#0092fc" },
  success: { bg: "#eaf3de", fg: "#27500a", solid: "#198754" },
  warning: { bg: "#fef3c7", fg: "#92400e", solid: "#d97706" },
  destructive: { bg: "#fcebeb", fg: "#a32d2d", solid: "#d4183d" },
};

/** Every module now shares the single brand color/tint — matches the mockup, which has one
 * consistent teal identity rather than a color per section. Kept as a map (not a flat constant)
 * so screens don't need to change their `accent.bg`/`accent.fg`/`accent.solid` call sites. */
const brandTile = { bg: "#e0f7fa", fg: brand.dark2, solid: brand.solid };
export const moduleColor = {
  profile: brandTile,
  attendance: brandTile,
  leave: brandTile,
  payroll: brandTile,
  hierarchy: brandTile,
};

/** Data-viz palette — Present/Absent/Leaves in the mockup's attendance pie chart use semantic
 * status colors (green/red/teal), not the brand hue, so charts stay readable at a glance. */
export const chart = {
  present: "#16a34a",
  absent: "#e11d48",
  leaves: brand.solid,
};

export type ModuleKey = keyof typeof moduleColor;

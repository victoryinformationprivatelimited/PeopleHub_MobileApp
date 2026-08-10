/**
 * Ported from the real PeopleHub brand tokens (Frontend/PeopleHub-ESS/src/index.css, itself
 * sourced from Design/ESS-Portal-Design-Standards-for-Figma.md §1-2) so the mobile app reads as
 * the same product as the web ESS portal instead of inventing its own palette. React Native has
 * no CSS gradient primitive without an extra dependency, so the brand gradient (#0092fc → #005796)
 * collapses to its solid midpoint `brand.solid` here rather than pulling in expo-linear-gradient
 * for one visual effect.
 */

export const brand = {
  solid: "#0092fc",
  dark: "#005796",
};

export const neutral = {
  background: "#f5f7fa",
  card: "#ffffff",
  text: "#14181f",
  textMuted: "#717182",
  textFaint: "#9a99a6",
  border: "rgba(0,0,0,0.08)",
};

/** Semantic tile pairs — light background + darker foreground, matching the web app's
 * info/success/warning/destructive/purple/pink tile tokens. `solid` is a higher-chroma variant
 * of the same hue for button fills, since the muted `fg` reads flat as white-on-color. */
export const semantic = {
  info: { bg: "#e6f1fb", fg: "#185fa5", solid: brand.solid },
  success: { bg: "#eaf3de", fg: "#27500a", solid: "#198754" },
  warning: { bg: "#faeeda", fg: "#854f0b", solid: "#d97706" },
  destructive: { bg: "#fcebeb", fg: "#a32d2d", solid: "#d4183d" },
  purple: { bg: "#eeedfe", fg: "#3c3489", solid: "#7c3aed" },
  pink: { bg: "#fbeaf0", fg: "#72243e", solid: "#db2777" },
};

/** One semantic color per ESS module, used for that module's Home tile, header, buttons, and
 * selected-chip states — gives each section a distinct identity instead of every screen reusing
 * the same flat blue. */
export const moduleColor = {
  profile: semantic.info,
  attendance: semantic.purple,
  leave: semantic.pink,
  payroll: semantic.success,
  hierarchy: semantic.warning,
};

export type ModuleKey = keyof typeof moduleColor;

/**
 * Brand identity ported from PeopleHub-ESS's design tokens (src/index.css's
 * `:root` — the matte teal-green pulled from the PeopleHub logo), replacing
 * this app's earlier standalone cyan/blue Figma identity so mobile matches
 * the ESS web app's actual palette. Structure (solid/light1/light2/dark1/
 * dark2/gradient) is unchanged so none of the ~19 files importing these
 * need to change — only the values do.
 */

export const brand = {
  solid: "#4f9b83",
  light1: "#5aab8f",
  light2: "#8fd0b3",
  dark1: "#3d7c68",
  /** Third stop of PeopleHub-ESS's AuthLayout gradient (rgba(44,74,64,...)) — the darkest
   * green in the ESS palette, used for hero-gradient bottoms and login backgrounds. */
  dark2: "#2c4a40",
  /** Matches PeopleHub-ESS/src/components/Layout/AuthLayout.tsx's panel gradient stops. */
  gradient: ["#5aab8f", "#3d7c68", "#2c4a40"] as const,
};

export const neutral = {
  background: "#f7f7f8",
  card: "#ffffff",
  text: "#1f2328",
  textMuted: "#6b7280",
  textFaint: "#9aa3ad",
  border: "rgba(31, 35, 40, 0.1)",
};

/** Ported from PeopleHub-ESS/src/index.css's semantic tokens (light theme). */
export const semantic = {
  info: { bg: "#eef1f5", fg: "#3b4a5a", solid: "#3b4a5a" },
  success: { bg: "#eafaf0", fg: "#167a4c", solid: "#167a4c" },
  warning: { bg: "#fff4e5", fg: "#9a5b0a", solid: "#9a5b0a" },
  destructive: { bg: "#fdecec", fg: "#b3261e", solid: "#b3261e" },
};

/** Every module now shares the single brand color/tint — matches PeopleHub-ESS, which has one
 * consistent green identity rather than a color per section. Kept as a map (not a flat constant)
 * so screens don't need to change their `accent.bg`/`accent.fg`/`accent.solid` call sites. */
const brandTile = { bg: "#e6f2ee", fg: brand.dark1, solid: brand.solid };
export const moduleColor = {
  profile: brandTile,
  attendance: brandTile,
  leave: brandTile,
  payroll: brandTile,
  hierarchy: brandTile,
};

/** Data-viz palette — Present/Absent/Leaves use semantic status colors (green/red/brand),
 * so charts stay readable at a glance regardless of the brand hue. */
export const chart = {
  present: semantic.success.solid,
  absent: "#e11d48",
  leaves: brand.solid,
};

export type ModuleKey = keyof typeof moduleColor;

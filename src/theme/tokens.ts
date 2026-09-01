/**
 * Color tokens ported from PeopleHub-ESS/src/index.css's `:root` variables —
 * same values, just camelCased for a plain TS object since RN has no CSS
 * custom properties. Light palette only — there's no theme toggle in this
 * app (removed per direct feedback), so no dark variant is needed.
 */
export interface ThemeTokens {
  brandA: string;
  brandB: string;
  brandC: string;
  background: string;
  foreground: string;
  card: string;
  mutedForeground: string;
  border: string;
  destructiveBg: string;
  destructiveFg: string;
  successBg: string;
  successFg: string;
  warningBg: string;
  warningFg: string;
  infoBg: string;
  infoFg: string;
}

export const tokens: ThemeTokens = {
  brandA: "#4f9b83",
  brandB: "#3d7c68",
  brandC: "#5aab8f",
  background: "#f7f7f8",
  foreground: "#1f2328",
  card: "#ffffff",
  mutedForeground: "#6b7280",
  border: "rgba(31, 35, 40, 0.1)",
  destructiveBg: "#fdecec",
  destructiveFg: "#b3261e",
  successBg: "#eafaf0",
  successFg: "#167a4c",
  warningBg: "#fff4e5",
  warningFg: "#9a5b0a",
  infoBg: "#eef1f5",
  infoFg: "#3b4a5a",
};

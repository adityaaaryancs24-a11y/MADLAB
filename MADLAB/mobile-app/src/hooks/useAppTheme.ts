import { useColorScheme } from "react-native";
import { useApp } from "../context/AppContext";

// ── Accent palettes ────────────────────────────────────────────────────────────
const DARK_ACCENT = {
  hex: "#2ECC71",
  hexLight: "#4ADE80",
  bg: "bg-[#2ECC71]",
  bgLight: "bg-[#2ECC71]/10",
  text: "text-[#2ECC71]",
  border: "border-[#2ECC71]",
  borderLight: "border-[#2ECC71]/20",
} as const;

const LIGHT_ACCENT = {
  hex: "#16A34A",
  hexLight: "#22C55E",
  bg: "bg-[#16A34A]",
  bgLight: "bg-[#16A34A]/10",
  text: "text-[#16A34A]",
  border: "border-[#16A34A]",
  borderLight: "border-[#16A34A]/20",
} as const;

// ── Theme palettes ─────────────────────────────────────────────────────────────
const DARK_THEME = {
  bg: "#0A0E15",
  bgCard: "#111827",
  bgCardAlt: "rgba(255,255,255,0.05)",
  text: "rgba(255,255,255,1)",
  textMuted: "rgba(255,255,255,0.5)",
  textDim: "rgba(255,255,255,0.3)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.15)",
  // Tailwind class equivalents
  bgClass: "bg-[#0A0E15]",
  cardClass: "bg-[#111827]",
  textClass: "text-white",
  textMutedClass: "text-white/50",
  borderClass: "border-white/10",
};

const LIGHT_THEME = {
  bg: "#F5F7FA",
  bgCard: "#FFFFFF",
  bgCardAlt: "rgba(0,0,0,0.04)",
  text: "rgba(15,23,42,1)",
  textMuted: "rgba(15,23,42,0.5)",
  textDim: "rgba(15,23,42,0.3)",
  border: "rgba(0,0,0,0.08)",
  borderStrong: "rgba(0,0,0,0.15)",
  bgClass: "bg-[#F5F7FA]",
  cardClass: "bg-white",
  textClass: "text-[#0F172A]",
  textMutedClass: "text-[#0F172A]/50",
  borderClass: "border-[#0F172A]/10",
};

// ── Font scale ─────────────────────────────────────────────────────────────────
const FONT_SCALE = {
  small: 0.88,
  medium: 1.0,
  large: 1.14,
} as const;

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAppTheme() {
  const { settings } = useApp();

  // Resolve effective theme
  const effectiveTheme: "dark" | "light" = (settings && settings.themeMode === "light") ? "light" : "dark";

  const isDark = effectiveTheme === "dark";
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const accent = isDark ? DARK_ACCENT : LIGHT_ACCENT;
  const fontSizeKey = (settings && settings.fontSize && FONT_SCALE[settings.fontSize]) ? settings.fontSize : "medium";
  const fontScale = FONT_SCALE[fontSizeKey];

  return {
    isDark,
    theme,
    accent,
    fontScale,
    // Convenience passthrough
    accentHex: accent.hex,
    accentHexLight: accent.hexLight,
  };
}

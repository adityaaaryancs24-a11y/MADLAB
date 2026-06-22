import { useColorScheme } from "react-native";
import { useApp } from "../context/AppContext";

// ── Accent palettes ────────────────────────────────────────────────────────────
const ACCENT_PALETTES = {
  emerald: {
    hex: "#2ECC71",
    hexLight: "#4ADE80",
    bg: "bg-[#2ECC71]",
    bgLight: "bg-[#2ECC71]/10",
    text: "text-[#2ECC71]",
    border: "border-[#2ECC71]",
    borderLight: "border-[#2ECC71]/20",
  },
  blue: {
    hex: "#3B82F6",
    hexLight: "#60A5FA",
    bg: "bg-[#3B82F6]",
    bgLight: "bg-[#3B82F6]/10",
    text: "text-[#3B82F6]",
    border: "border-[#3B82F6]",
    borderLight: "border-[#3B82F6]/20",
  },
  orange: {
    hex: "#F4A261",
    hexLight: "#FB923C",
    bg: "bg-[#F4A261]",
    bgLight: "bg-[#F4A261]/10",
    text: "text-[#F4A261]",
    border: "border-[#F4A261]",
    borderLight: "border-[#F4A261]/20",
  },
  purple: {
    hex: "#8B5CF6",
    hexLight: "#A78BFA",
    bg: "bg-[#8B5CF6]",
    bgLight: "bg-[#8B5CF6]/10",
    text: "text-[#8B5CF6]",
    border: "border-[#8B5CF6]",
    borderLight: "border-[#8B5CF6]/20",
  },
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
  const systemColorScheme = useColorScheme(); // "light" | "dark" | null

  // Resolve effective theme
  const effectiveTheme: "dark" | "light" = (() => {
    if (settings.themeMode === "light") return "light";
    if (settings.themeMode === "dark") return "dark";
    // system
    return systemColorScheme === "light" ? "light" : "dark";
  })();

  const isDark = effectiveTheme === "dark";
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const accent = ACCENT_PALETTES[settings.accentColor] ?? ACCENT_PALETTES.emerald;
  const fontScale = FONT_SCALE[settings.fontSize] ?? 1.0;

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

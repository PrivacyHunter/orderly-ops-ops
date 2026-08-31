export type ThemeMode = "dark" | "light";

export type ThemeConfig = {
  goldAccent: string;
  cyanAccent: string;
  darkBackground: string;
  lightBackground: string;
  displayFont: string;
  bodyFont: string;
  displayTracking: string;
  radius: string;
  sectionSpace: string;
  containerWidth: string;
  glassOpacity: number;
  defaultMode: ThemeMode;
};

export const DEFAULT_THEME: ThemeConfig = {
  goldAccent: "#dc2626",
  cyanAccent: "#0f172a",
  darkBackground: "#0f172a",
  lightBackground: "#ffffff",
  displayFont: '"Barlow Condensed", "Syne", sans-serif',
  bodyFont: '"Plus Jakarta Sans", "Inter", sans-serif',
  displayTracking: "-0.01em",
  radius: "0.9rem",
  sectionSpace: "6rem",
  containerWidth: "80rem",
  glassOpacity: 5,
  defaultMode: "light",
};

export const FONT_PRESETS = [
  { label: "Barlow Condensed / Plus Jakarta", display: '"Barlow Condensed", sans-serif', body: '"Plus Jakarta Sans", sans-serif' },
  { label: "Syne / Plus Jakarta", display: '"Syne", sans-serif', body: '"Plus Jakarta Sans", sans-serif' },
  { label: "Space Grotesk / Inter", display: '"Space Grotesk", sans-serif', body: '"Inter", sans-serif' },
  { label: "Syne / Inter", display: '"Syne", sans-serif', body: '"Inter", sans-serif' },
];

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  luxury: {
    ...DEFAULT_THEME,
    goldAccent: "#ef1822",
    darkBackground: "#05060a",
    cyanAccent: "#ff4d57",
  },
  neon: {
    ...DEFAULT_THEME,
    goldAccent: "#ff2d3c",
    cyanAccent: "#ffffff",
    darkBackground: "#000000",
  },
  studio: {
    ...DEFAULT_THEME,
    goldAccent: "#111111",
    cyanAccent: "#333333",
    lightBackground: "#ffffff",
    defaultMode: "light",
  },
};


export type BrandingConfig = {
  logoText: string;
  logoUrl: string;
  faviconUrl: string;
  showNotificationBar: boolean;
  notificationText: string;
  showTopInfoBar: boolean;
  showSocialIcons: boolean;
  showFooterCredit: boolean;
  footerCreditText: string;
  footerDescription: string;
  showWhatsappButton: boolean;
  whatsappNumber: string;
  phone: string;
  email: string;
};

export const DEFAULT_BRANDING: BrandingConfig = {
  logoText: "Ambition Sports",
  logoUrl: "/logo.png",
  faviconUrl: "",
  showNotificationBar: true,
  notificationText: "Premium Custom Sportswear — Worldwide Shipping Available",
  showTopInfoBar: true,
  showSocialIcons: true,
  showFooterCredit: true,
  footerCreditText: "Crafted by Ambition Sports Studio",
  footerDescription: "Premium custom sportswear and activewear manufacturer based in Sialkot, Pakistan. Delivering high-performance apparel worldwide.",
  showWhatsappButton: true,
  whatsappNumber: "+923049893054",
  phone: "+92 (304) 989-3054",
  email: "ambitionsports381@gmail.com",
};

/** CSS custom properties derived from a theme config. */
export function themeVars(theme: ThemeConfig, mode: ThemeMode): Record<string, string> {
  const isDark = mode === "dark";
  return {
    "--gold": theme.goldAccent,
    "--neon-lime": theme.cyanAccent,
    "--primary": theme.goldAccent,
    "--ring": theme.goldAccent,
    "--accent": theme.cyanAccent,
    "--neon-cyan": theme.cyanAccent,
    "--background": isDark ? theme.darkBackground : theme.lightBackground,
    "--nav-bg": isDark ? "transparent" : "#ffffff",
    "--nav-foreground": isDark ? "#ffffff" : "#0a0a0a",
    "--foreground": isDark ? "#f8fafc" : "#0a0a0a",
    "--card": isDark ? "#1e2532" : "#ffffff",
    "--border": isDark ? "rgb(255 255 255 / 16%)" : "rgb(10 10 10 / 14%)",
    "--font-display-family": theme.displayFont,
    "--font-body-family": theme.bodyFont,
    "--display-tracking": theme.displayTracking,
    "--radius": theme.radius,
    "--section-space": theme.sectionSpace,
    "--container-width": theme.containerWidth,
    "--surface": `rgb(${isDark ? "255 255 255" : "15 23 42"} / ${theme.glassOpacity}%)`,
    "--surface-strong": `rgb(${isDark ? "255 255 255" : "15 23 42"} / ${theme.glassOpacity * 1.5}%)`,
    "--surface-soft": `rgb(${isDark ? "255 255 255" : "15 23 42"} / ${theme.glassOpacity * 0.5}%)`,
  };
}

export function parseJson<T>(raw: string | undefined | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as object) } as T;
  } catch {
    return fallback;
  }
}

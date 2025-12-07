import { type Theme, type ThemeName } from "@/lib/schemas";

export const themes = {
  normal: {
    background: "#ffffff",
    text: "#000000",
    level4: "#216e39",
    level3: "#30a14e",
    level2: "#40c463",
    level1: "#9be9a8",
    level0: "#ebedf0",
  },
  classic: {
    background: "#ffffff",
    text: "#000000",
    level4: "#196127",
    level3: "#239a3b",
    level2: "#7bc96f",
    level1: "#c6e48b",
    level0: "#ebedf0",
  },
  githubDark: {
    background: "#0C0E12",
    text: "#C0C0C0",
    level4: "#35CE42",
    level3: "#249A32",
    level2: "#0D5C25",
    level1: "#0E361E",
    level0: "#121519",
  },
  dracula: {
    background: "#181818",
    text: "#f8f8f2",
    level4: "#ff79c6",
    level3: "#bd93f9",
    level2: "#6272a4",
    level1: "#44475a",
    level0: "#282a36",
  },
  bnw: {
    background: "#000000",
    text: "#F6F6F6",
    level4: "#F6F6F6",
    level3: "#c8c8c8",
    level2: "#646464",
    level1: "#323232",
    level0: "#161616",
  },
  spooky: {
    background: "#000000",
    text: "#F6F6F6",
    level4: "#fddf68",
    level3: "#fa7a18",
    level2: "#bd561d",
    level1: "#631c03",
    level0: "#161b22",
  },
  winter: {
    background: "#000000",
    text: "#F6F6F6",
    level4: "#B6E3FF",
    level3: "#54AEFF",
    level2: "#0969DA",
    level1: "#0A3069",
    level0: "#161b22",
  },
  christmas: {
    background: "#0f1c0f",
    text: "#f0e6d2",
    level4: "#c41e3a",
    level3: "#165b33",
    level2: "#e74c3c",
    level1: "#27ae60",
    level0: "#1a2921",
  },
  ocean: {
    background: "#001a33",
    text: "#e0f2f7",
    level4: "#00d4ff",
    level3: "#0099cc",
    level2: "#006699",
    level1: "#004466",
    level0: "#002b44",
  },
  sunset: {
    background: "#1a0a2e",
    text: "#ffeaa7",
    level4: "#ff6b6b",
    level3: "#ee5a6f",
    level2: "#c44569",
    level1: "#786fa6",
    level0: "#2d1b4e",
  },
  forest: {
    background: "#0d1b0d",
    text: "#d4e8d4",
    level4: "#86c232",
    level3: "#61892f",
    level2: "#4a6023",
    level1: "#33421a",
    level0: "#1b2816",
  },
  neon: {
    background: "#0a0e27",
    text: "#e6f1ff",
    level4: "#ff00ff",
    level3: "#00ffff",
    level2: "#ff00aa",
    level1: "#0088ff",
    level0: "#151933",
  },
  candy: {
    background: "#fff5f7",
    text: "#5a3e5e",
    level4: "#ff6b9d",
    level3: "#c44569",
    level2: "#ffa8c5",
    level1: "#ffd3e1",
    level0: "#ffe5ec",
  },
  fire: {
    background: "#1a0000",
    text: "#ffe6cc",
    level4: "#ff4500",
    level3: "#ff6347",
    level2: "#ff7f50",
    level1: "#ffa500",
    level0: "#2d1010",
  },
} as const satisfies Record<string, Theme>;

// Validate that our themes object keys match the Zod schema
// This ensures the schema and themes stay in sync at compile time
type ThemeKeys = keyof typeof themes;
type _ValidateThemeKeys = ThemeKeys extends ThemeName
  ? ThemeName extends ThemeKeys
    ? true
    : never
  : never;
const _typeCheck: _ValidateThemeKeys = true;

// Re-export ThemeName from schemas as AvailableThemeNames for backwards compatibility
export type AvailableThemeNames = ThemeName;

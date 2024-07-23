export type Theme = {
  background: string;
  text: string;
  level4: string;
  level3: string;
  level2: string;
  level1: string;
  level0: string;
};

export const themes: Record<"normal" | "classic" | "githubDark" | "dracula" | "bnw" | "spooky" | "winter", Theme> = {
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
};

export type AvailableThemeNames = keyof typeof themes;

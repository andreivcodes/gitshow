export type Theme = {
  background: string;
  text: string;
  level4: string;
  level3: string;
  level2: string;
  level1: string;
  level0: string;
};

export const themes: Record<"normal" | "classic" | "githubDark" | "dracula" | "bnw" | "spooky", Theme> = {
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
    background: "#101217",
    text: "#C0C0C0",
    level4: "#27d545",
    level3: "#10983d",
    level2: "#00602d",
    level1: "#003820",
    level0: "#161b22",
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
    level3: "#DDDDDD",
    level2: "#A5A5A5",
    level1: "#646464",
    level0: "#2F2F2F",
  },
  spooky: {
    background: "#000000",
    text: "#F6F6F6",
    level4: "#FDF156",
    level3: "#FFC722",
    level2: "#FF9711",
    level1: "#EE964B",
    level0: "#EEEEEE",
  },
};

export type AvailableThemeNames = keyof typeof themes;

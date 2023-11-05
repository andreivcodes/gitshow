export type Theme = {
  background: string;
  text: string;
  intensity4: string;
  intensity3: string;
  intensity2: string;
  intensity1: string;
  intensity0: string;
};

export const themes: Record<
  "normal" | "classic" | "githubDark" | "dracula" | "blue",
  Theme
> = {
  normal: {
    background: "#ffffff",
    text: "#000000",
    intensity4: "#216e39",
    intensity3: "#30a14e",
    intensity2: "#40c463",
    intensity1: "#9be9a8",
    intensity0: "#ebedf0",
  },
  classic: {
    background: "#ffffff",
    text: "#000000",
    intensity4: "#196127",
    intensity3: "#239a3b",
    intensity2: "#7bc96f",
    intensity1: "#c6e48b",
    intensity0: "#ebedf0",
  },
  githubDark: {
    background: "#101217",
    text: "#ffffff",
    intensity4: "#27d545",
    intensity3: "#10983d",
    intensity2: "#00602d",
    intensity1: "#003820",
    intensity0: "#161b22",
  },
  dracula: {
    background: "#181818",
    text: "#f8f8f2",
    intensity4: "#ff79c6",
    intensity3: "#bd93f9",
    intensity2: "#6272a4",
    intensity1: "#44475a",
    intensity0: "#282a36",
  },
  blue: {
    background: "#181818",
    text: "#C0C0C0",
    intensity4: "#4F83BF",
    intensity3: "#416895",
    intensity2: "#344E6C",
    intensity1: "#263342",
    intensity0: "#222222",
  },
};

export type AvailableThemeNames = keyof typeof themes;

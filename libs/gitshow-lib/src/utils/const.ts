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
  "normal" | "classic" | "githubDark" | "dracula" | "bnw" | "spooky",
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
    text: "#C0C0C0",
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
  bnw: {
    background: "#000000",
    text: "#F6F6F6",
    intensity4: "#F6F6F6",
    intensity3: "#DDDDDD",
    intensity2: "#A5A5A5",
    intensity1: "#646464",
    intensity0: "#2F2F2F",
  },
  spooky: {
    background: "#000000",
    text: "#F6F6F6",
    intensity4: "#FDF156",
    intensity3: "#FFC722",
    intensity2: "#FF9711",
    intensity1: "#EE964B",
    intensity0: "#EEEEEE",
  },
};

//Themes
export type AvailableThemeNames = keyof typeof themes;

export const PREMIUM_THEMES = ["dracula", "bnw", "spooky"];

export enum UpdateInterval {
  EVERY_DAY = 24,
  EVERY_WEEK = 168,
  EVERY_MONTH = 720,
}

export const PREMIUM_INTERVALS = [
  UpdateInterval.EVERY_WEEK,
  UpdateInterval.EVERY_DAY,
];

export enum SubscriptionPlan {
  Free = "FREE",
  Premium = "PREMIUM",
}

export enum StripePlans {
  Premium = "price_1OiD7MHNuNMEdXGMG66sRk8w",
}

export interface UpdateUserEvent {
  email: string;
  githubUsername: string;
  twitterOAuthToken: string;
  twitterOAuthTokenSecret: string;
  plan: SubscriptionPlan;
  theme: AvailableThemeNames;
}

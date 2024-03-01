import { RDSData } from "@aws-sdk/client-rds-data";
import { Insertable, Kysely, Selectable, Updateable } from "kysely";
import { DataApiDialect } from "kysely-data-api";
import { RDS } from "sst/node/rds";
import { DB, SubscriptionPlan, RefreshInterval, type SubscriptionPlan as SubscriptionPlanType, type RefreshInterval as RefreshIntervalType, User } from "./schema";

const dataApi = new DataApiDialect({
  mode: "postgres",
  driver: {
    client: new RDSData({}),
    database: "gitshow_db",
    secretArn: RDS.Database.secretArn,
    resourceArn: RDS.Database.clusterArn,
  },
});

type SelectUser = Selectable<User>
type NewUser = Insertable<User>
type UpdateUser = Updateable<User>

export const db = new Kysely<DB>({ dialect: dataApi });
export { type SelectUser, type NewUser, type UpdateUser, SubscriptionPlan, RefreshInterval, type SubscriptionPlanType, RefreshIntervalType }

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

export const PREMIUM_INTERVALS: Array<typeof RefreshInterval[keyof typeof RefreshInterval]> = [
  RefreshInterval.EVERY_WEEK,
  RefreshInterval.EVERY_DAY,
];

export enum StripePlans {
  Premium = "price_1OiD7MHNuNMEdXGMG66sRk8w",
}

export * from "./types"

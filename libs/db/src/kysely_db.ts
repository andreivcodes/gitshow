/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [x: string]: JsonValue | undefined;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface JobQueue {
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  status: Generated<string>;
  userId: string;
}

export interface User {
  automaticallyUpdate: Generated<boolean>;
  contribData: Json | null;
  email: string;
  githubAuthenticated: boolean | null;
  githubId: string | null;
  githubToken: string | null;
  githubUsername: string | null;
  id: Generated<string>;
  lastFetchTimestamp: Timestamp | null;
  lastUpdateTimestamp: Timestamp | null;
  theme: Generated<string>;
  twitterAuthenticated: boolean | null;
  twitterId: string | null;
  twitterOauthToken: string | null;
  twitterOauthTokenSecret: string | null;
  twitterPicture: string | null;
  twitterTag: string | null;
  twitterUsername: string | null;
  updateInterval: Generated<string>;
}

export interface DB {
  jobQueue: JobQueue;
  user: User;
}
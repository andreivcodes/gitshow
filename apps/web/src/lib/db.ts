import { PrismaClient } from "@prisma/client";
import { config as dotenv_config } from "dotenv";

dotenv_config();

export const QUEUE_NAME = "update";

export type Rabbit_Message = {
  userId: string;
};

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export { prisma, };

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

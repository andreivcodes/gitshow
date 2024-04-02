import { PrismaClient } from "@prisma/client";
import amqplib from "amqplib";
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
  var rbmq_conn: undefined | amqplib.Connection;
  var rbmq_ch: undefined | amqplib.Channel;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();
const rbmq_conn = globalThis.rbmq_conn ?? (await amqplib.connect(process.env.RABBITMQ_URL!));
const rbmq_ch = globalThis.rbmq_ch ?? (await rbmq_conn.createChannel());

export { prisma, rbmq_conn, rbmq_ch };

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
  globalThis.rbmq_conn = rbmq_conn;
  globalThis.rbmq_ch = rbmq_ch;
}

import { connection } from "next/server";
import { db, sql } from "@/lib/db";

export async function GET() {
  // Opt out of prerendering: this must hit the database on every request.
  await connection();

  try {
    await sql`SELECT 1`.execute(db);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[Health] Database check failed:", error);
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

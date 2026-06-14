export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { runDiscoveryPipeline } from "@/lib/pipeline";

// Triggered by Vercel Cron (see vercel.json). Protected by CRON_SECRET.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runDiscoveryPipeline();
  return NextResponse.json({ ok: true, ...result, at: new Date().toISOString() });
}

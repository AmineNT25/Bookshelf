export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const check = await verifyAdmin(req);
  if (!check.ok) return NextResponse.json({ isAdmin: false }, { status: check.status });
  return NextResponse.json({ isAdmin: true });
}

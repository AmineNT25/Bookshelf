import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    return NextResponse.json({
      hasSession: !!session,
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      name: session?.user?.name ?? null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown" }, { status: 500 });
  }
}

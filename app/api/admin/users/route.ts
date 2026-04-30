export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(req: Request) {
  const check = await verifyAdmin(req);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { data: { users }, error } = await getSupabase().auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const check = await verifyAdmin(req);
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: check.status });

  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "email and password required" }, { status: 400 });

  const { data: { user }, error } = await getSupabase().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(user, { status: 201 });
}

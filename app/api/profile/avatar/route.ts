export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabase } from "@/lib/supabase";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_BYTES = 2 * 1024 * 1024;

async function getUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;
  } catch {}
  return null;
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG and PNG files are allowed." },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File must be under 2MB." },
      { status: 400 },
    );
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${userId}/avatar.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await getSupabase()
    .storage
    .from("avatars")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = getSupabase()
    .storage
    .from("avatars")
    .getPublicUrl(path);

  await getSupabase()
    .from("profiles")
    .upsert(
      { id: userId, avatar_url: publicUrl, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );

  return NextResponse.json({ avatar_url: publicUrl });
}

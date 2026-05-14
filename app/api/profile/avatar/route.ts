export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_BYTES = 2 * 1024 * 1024;

async function getUserId(): Promise<string | null> {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
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

  const supabase = await getSupabaseServerClient();
  const { error: uploadError } = await supabase
    .storage
    .from("avatars")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase
    .storage
    .from("avatars")
    .getPublicUrl(path);

  await supabase
    .from("profiles")
    .upsert(
      { id: userId, avatar_url: publicUrl, updated_at: new Date().toISOString() },
      { onConflict: "id" },
    );

  return NextResponse.json({ avatar_url: publicUrl });
}

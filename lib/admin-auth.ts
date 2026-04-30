import { getSupabase } from "./supabase";

export async function verifyAdmin(req: Request): Promise<{ ok: boolean; status: number; error?: string }> {
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false, status: 401, error: "Unauthorized" };

  const { data: { user }, error } = await getSupabase().auth.getUser(token);
  if (error || !user) return { ok: false, status: 401, error: "Unauthorized" };

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || user.email !== adminEmail) return { ok: false, status: 403, error: "Forbidden" };

  return { ok: true, status: 200 };
}

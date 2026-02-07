import { supabase } from "@/lib/supabaseClient";

const LOCAL_KEY = "pns_state_v2";

export async function cloudSave(): Promise<{ ok: boolean; message: string }> {
  if (typeof window === "undefined") return { ok: false, message: "No window." };

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return { ok: false, message: "Not signed in." };

  const raw = localStorage.getItem(LOCAL_KEY);
  const state = raw ? JSON.parse(raw) : null;

  const { error } = await supabase
    .from("pns_user_state")
    .upsert({ user_id: user.id, state, updated_at: new Date().toISOString() });

  if (error) return { ok: false, message: error.message };

  return { ok: true, message: "Saved to cloud!" };
}

export async function cloudLoad(): Promise<{ ok: boolean; message: string }> {
  if (typeof window === "undefined") return { ok: false, message: "No window." };

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return { ok: false, message: "Not signed in." };

  const { data, error } = await supabase
    .from("pns_user_state")
    .select("state")
    .eq("user_id", user.id)
    .single();

  if (error) return { ok: false, message: error.message };
  if (!data?.state) return { ok: false, message: "Nothing saved yet." };

  localStorage.setItem(LOCAL_KEY, JSON.stringify(data.state));
  return { ok: true, message: "Loaded from cloud! Refreshing your app…" };
}

import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabaseServer";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { origin } = new URL(req.url);

  // 1) Must be signed in
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // 2) Get this user's Stripe customer id from your table
  const { data: row, error } = await supabase
    .from("pns_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .single();

  if (error || !row?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No Stripe customer found yet. Subscribe first." },
      { status: 400 }
    );
  }

  // 3) Create a portal session (Stripe returns a short-lived URL)
  const session = await stripe.billingPortal.sessions.create({
    customer: row.stripe_customer_id,
    return_url: `${origin}/app/settings`,
  });

  return NextResponse.json({ url: session.url });
}

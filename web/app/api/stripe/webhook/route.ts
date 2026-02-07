import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getEnv(name: string) {
  return (process.env[name] ?? "").trim();
}

function isValidHttpUrl(s: string) {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function toIsoFromUnixSeconds(sec: unknown): string | null {
  if (typeof sec !== "number") return null;
  return new Date(sec * 1000).toISOString();
}

export async function POST(req: Request) {
  // Stripe signature verification needs the RAW body string. :contentReference[oaicite:2]{index=2}
  const stripeSecret = getEnv("STRIPE_SECRET_KEY");
  const webhookSecret = getEnv("STRIPE_WEBHOOK_SECRET");

  if (!stripeSecret) {
    return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
  }
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing Stripe-Signature header" }, { status: 400 });
  }

  const rawBody = await req.text();

  const stripe = new Stripe(stripeSecret);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Signature verification failed: ${err?.message ?? "unknown"}` },
      { status: 400 }
    );
  }

  // IMPORTANT: Create Supabase admin client INSIDE the request (not at module load)
  // Service keys bypass RLS and must never be in the browser. :contentReference[oaicite:3]{index=3}
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL") || getEnv("SUPABASE_URL");
  const serviceKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !isValidHttpUrl(supabaseUrl)) {
    return NextResponse.json(
      { error: "Invalid NEXT_PUBLIC_SUPABASE_URL (must start with http/https)" },
      { status: 500 }
    );
  }
  if (!serviceKey) {
    return NextResponse.json({ error: "Missing SUPABASE_SERVICE_ROLE_KEY" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // ---- Handle events ----
  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const userId =
        session.client_reference_id ||
        session.metadata?.user_id ||
        session.metadata?.supabase_user_id;

      // If you haven’t attached a user id to the Checkout Session yet, we can’t map it.
      // We still return 200 so Stripe doesn’t retry forever.
      if (!userId) return NextResponse.json({ received: true });

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null;

      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null;

      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items?.data?.[0]?.price?.id ?? null;

        const currentPeriodEnd = toIsoFromUnixSeconds(
          (sub as any)["current_period_end"]
        );

        await supabaseAdmin.from("pns_subscriptions").upsert(
          {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            stripe_price_id: priceId,
            status: sub.status,
            current_period_end: currentPeriodEnd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const sub = event.data.object as Stripe.Subscription;

      const userId =
        (sub.metadata as any)?.user_id || (sub.metadata as any)?.supabase_user_id;

      if (!userId) return NextResponse.json({ received: true });

      const customerId =
        typeof sub.customer === "string" ? sub.customer : (sub.customer as any)?.id ?? null;

      const priceId = sub.items?.data?.[0]?.price?.id ?? null;

      const currentPeriodEnd = toIsoFromUnixSeconds(
        (sub as any)["current_period_end"]
      );

      await supabaseAdmin.from("pns_subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: sub.id,
          stripe_price_id: priceId,
          status: sub.status,
          current_period_end: currentPeriodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Webhook handler error" }, { status: 500 });
  }
}

import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-01-28.clover",

});

export async function POST(req: Request) {
  const { origin } = new URL(req.url);

  const price = process.env.STRIPE_PRICE_ID!;
  if (!price) {
    return NextResponse.json({ error: "Missing STRIPE_PRICE_ID" }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/app/pro?success=1`,
    cancel_url: `${origin}/app/pro?canceled=1`,
  });

  return NextResponse.json({ url: session.url });
}

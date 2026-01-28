import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  // Handle the event
  // TODO: Implement actual billing logic when ready
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", session.id);
      // TODO: Update tenant subscription status in database
      // TODO: Send welcome email to customer
      break;
    }

    case "customer.subscription.created": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription created:", subscription.id);
      // TODO: Update tenant subscription fields
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription updated:", subscription.id);
      // TODO: Update tenant subscription status
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription deleted:", subscription.id);
      // TODO: Handle subscription cancellation
      // TODO: Optionally downgrade tenant to free tier
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Invoice paid:", invoice.id);
      // TODO: Record payment in database
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Invoice payment failed:", invoice.id);
      // TODO: Handle failed payment (notify customer, etc.)
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

import { NextResponse } from "next/server";

// Razorpay is no longer used. This endpoint is intentionally disabled.
export async function POST() {
  return NextResponse.json({ error: "Razorpay disabled" }, { status: 410 });
}

export async function GET() {
  return NextResponse.json({ error: "Razorpay disabled" }, { status: 410 });
}

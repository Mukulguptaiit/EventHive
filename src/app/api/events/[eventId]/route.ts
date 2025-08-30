import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { eventId: string } }) {
  try {
    const event = await prisma.event.findUnique({ where: { id: params.eventId } });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (error) {
    console.error(`/api/events/${params.eventId} error`, error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

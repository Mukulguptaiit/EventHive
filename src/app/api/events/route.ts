import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured") === "true";
    const trending = searchParams.get("trending") === "true";
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const q = searchParams.get("q");
    const limit = Number(searchParams.get("limit") || "20");
    const skip = Number(searchParams.get("skip") || "0");

    const where: any = {};
    if (featured) where.featured = true;
    if (trending) where.trending = true;
    if (category) where.category = category;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { shortDescription: { contains: q, mode: "insensitive" } },
        { tags: { hasSome: [q] } },
        { city: { contains: q, mode: "insensitive" } },
        { state: { contains: q, mode: "insensitive" } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { trending: "desc" },
        { startDate: "asc" },
      ],
      take: Math.min(Math.max(limit, 1), 100),
      skip: Math.max(skip, 0),
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("/api/events error", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

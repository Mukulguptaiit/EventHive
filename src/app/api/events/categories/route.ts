import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const groups = await prisma.event.groupBy({
      by: ["category"],
      _count: { _all: true },
    });

    const total = await prisma.event.count();

    const categories = groups.map((g) => ({
      category: g.category,
      count: g._count._all,
    }));

    return NextResponse.json({ total, categories });
  } catch (error) {
    console.error("/api/events/categories error", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

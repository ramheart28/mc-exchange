import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// GET /api/exchanges/shop
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");

  // Parse query params for shop (since GET requests don't have a body)
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.json({ error: "Missing shop parameter" }, { status: 400 });
  }

  const url = `${BACKEND_URL}/user/exchanges/shop?shop=${encodeURIComponent(shop)}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch shop exchanges" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
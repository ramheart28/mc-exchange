import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

// GET /api/regions/[id]/shops
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.headers.get("authorization");
  const regionId = params.id;

  const res = await fetch(`${BACKEND_URL}/regions/${regionId}/shops`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}),
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch shops for region" }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
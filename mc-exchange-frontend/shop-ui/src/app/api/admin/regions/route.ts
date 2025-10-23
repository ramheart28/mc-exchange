import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001"; // adjust as needed

// GET All regions
export async function GET() {
  const res = await fetch(`${BACKEND_URL}/admin/regions`);
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch regions" }, { status: res.status });
  }
  const data = await res.json();
  return NextResponse.json(data);

}

//POST Create Region
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${BACKEND_URL}/admin/regions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

//PATCH Edit Region



//DELETE Region
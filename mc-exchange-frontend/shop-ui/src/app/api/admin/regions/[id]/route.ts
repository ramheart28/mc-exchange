import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Forward the Authorization header if present
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const auth = req.headers.get("authorization");
    if (auth) headers["authorization"] = auth;

    const res = await fetch(`${BACKEND_URL}/admin/regions/${id}`, {
      method: "PATCH",
      headers,
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;

    // Forward the Authorization header if present
    const headers: Record<string, string> = {};
    const auth = req.headers.get("authorization");
    if (auth) headers["authorization"] = auth;

    const res = await fetch(`${BACKEND_URL}/admin/regions/${id}`, {
      method: "DELETE",
      headers,
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
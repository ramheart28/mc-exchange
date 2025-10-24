import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// GET /api/admin/users
export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const response = await axios.get(`${BACKEND_URL}/admin/users`, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.details || error.message || 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
}

// PATCH /api/admin/users/:id
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }
    const { id } = params;
    const body = await request.json();
    const response = await axios.patch(`${BACKEND_URL}/admin/users/${id}`, body, {
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/json'
      }
    });
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.details || error.message || 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
}
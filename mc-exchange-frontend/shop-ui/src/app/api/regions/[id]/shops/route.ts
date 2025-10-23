import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const response = await axios.get(`${BACKEND_URL}/owner/regions/${id}/shops`, {
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
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

//GET handler for fetching shops in a region
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

// PATCH handler for editing a shop in a region
export async function PATCH(
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

    const body = await request.json();

    // Forward PATCH to backend
    const response = await axios.patch(
      `${BACKEND_URL}/owner/regions/${id}/shops`,
      body,
      {
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.details || error.message || 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
}

//POST for creating a new shop
export async function POST(
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

    const body = await request.json();

    // Forward POST to backend
    const response = await axios.post(
      `${BACKEND_URL}/owner/regions/${id}/shops`,
      body,
      {
        headers: {
          'Authorization': authorization,
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.details || error.message || 'Internal server error' },
      { status: error.response?.status || 500 }
    );
  }
}



//POST Create region

//PATCH Edit Region

//DELETE Region
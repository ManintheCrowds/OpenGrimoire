import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, props: { params: Promise<{ dataset: string }> }) {
  const params = await props.params;
  try {
    // Basic API route for test data
    return NextResponse.json({ 
      message: 'Test data endpoint',
      dataset: params.dataset 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch test data' },
      { status: 500 }
    );
  }
} 
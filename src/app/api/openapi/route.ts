import { NextResponse } from 'next/server';
import { openApiDocument } from '@/lib/openapi/openapi-document';

/**
 * Partial OpenAPI 3 document (OA-REST-2). Also available at GET /api/openapi.json via rewrite.
 */
export async function GET() {
  return NextResponse.json(openApiDocument, {
    headers: {
      'Cache-Control': 'public, max-age=300',
    },
  });
}

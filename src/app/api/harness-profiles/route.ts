import { NextResponse } from 'next/server';
import { checkAlignmentOrAdminSession } from '@/lib/alignment-context/api-auth';
import { harnessProfileCreateBodySchema, harnessProfileImportBodySchema } from '@/lib/harness-profiles/schemas';
import {
  createHarnessProfile,
  exportHarnessProfilesToFile,
  importHarnessProfilesFromFile,
  listHarnessProfiles,
} from '@/lib/storage/repositories/harness-profiles';

export async function GET(request: Request) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) return gate.response;
  const items = listHarnessProfiles();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) return gate.response;

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = harnessProfileCreateBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
  }

  const item = createHarnessProfile(parsed.data);
  return NextResponse.json({ item }, { status: 201 });
}

export async function PUT(request: Request) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    json = {};
  }
  const body = harnessProfileImportBodySchema.safeParse(json);
  if (!body.success) {
    return NextResponse.json({ error: 'Validation failed', issues: body.error.flatten() }, { status: 400 });
  }

  if (action === 'import') {
    const result = importHarnessProfilesFromFile(body.data.file);
    return NextResponse.json(result);
  }
  if (action === 'export') {
    const result = exportHarnessProfilesToFile(body.data.file);
    return NextResponse.json(result);
  }
  return NextResponse.json({ error: 'Unknown action. Use ?action=import or ?action=export' }, { status: 400 });
}

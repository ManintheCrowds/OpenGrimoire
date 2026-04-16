import { NextResponse } from 'next/server';
import { harnessProfileSelectionSchema } from '@/lib/harness-profiles/schemas';
import { getHarnessProfileById, listHarnessProfiles } from '@/lib/storage/repositories/harness-profiles';

export async function GET() {
  const items = listHarnessProfiles();
  const selected = items.find((item) => item.is_default) ?? items[0] ?? null;
  return NextResponse.json({ selected, items });
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = harnessProfileSelectionSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
  }
  const selected = getHarnessProfileById(parsed.data.harness_profile_id);
  if (!selected) {
    return NextResponse.json({ error: 'Harness profile not found' }, { status: 404 });
  }
  return NextResponse.json({ selected });
}

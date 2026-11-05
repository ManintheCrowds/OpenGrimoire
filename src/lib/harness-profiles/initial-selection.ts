/**
 * Decide whether a GET /api/harness-profiles/select payload may fill the form.
 * Call this with the profile id observed after the request returns. An id captured
 * when the request started is stale: draft restore and the operator's own change
 * both land after the effect is scheduled.
 */
export function harnessProfileIdFromSelection(
  currentId: string | undefined,
  selectedId: string | undefined
): string | undefined {
  if (typeof currentId === 'string' && currentId.trim() !== '') return undefined;
  if (typeof selectedId !== 'string') return undefined;
  const trimmed = selectedId.trim();
  return trimmed === '' ? undefined : trimmed;
}

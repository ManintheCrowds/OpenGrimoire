export type BootstrapTokenPayload = {
  token?: string | null;
  required?: boolean;
  expiresIn?: number | null;
};

export type BootstrapParseResult =
  | { status: 'ok'; token: string | null; required: boolean }
  | { status: 'failed' };

/** Parse GET /api/survey/bootstrap-token JSON for client submit gating. */
export function parseBootstrapTokenResponse(data: BootstrapTokenPayload): BootstrapParseResult {
  const required = data.required === true || (data.required !== false && data.expiresIn != null);
  if (data.token) {
    return { status: 'ok', token: data.token, required };
  }
  if (!required) {
    return { status: 'ok', token: null, required: false };
  }
  return { status: 'failed' };
}

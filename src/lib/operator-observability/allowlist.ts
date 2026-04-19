/** Hostnames probe runners may report for v1 (expand deliberately; no open SSRF). */
export const ALLOWED_OPERATOR_PROBE_TARGET_HOSTS = ['api.cursor.com'] as const;

export type AllowedOperatorProbeTargetHost = (typeof ALLOWED_OPERATOR_PROBE_TARGET_HOSTS)[number];

export function isAllowedOperatorProbeTargetHost(host: string): host is AllowedOperatorProbeTargetHost {
  const h = host.trim().toLowerCase();
  return (ALLOWED_OPERATOR_PROBE_TARGET_HOSTS as readonly string[]).includes(h);
}

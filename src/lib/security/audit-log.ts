import fs from 'node:fs';
import path from 'node:path';

export type SecurityAuditEvent = {
  ts: string;
  event: 'auth_failed' | 'sensitive_mutation';
  route: string;
  method: string;
  status: number;
  reason?: string;
};

function auditLogPath(): string {
  return process.env.OPENGRIMOIRE_SECURITY_AUDIT_LOG?.trim() || path.join(process.cwd(), 'data', 'security-audit.jsonl');
}

export function appendSecurityAuditEvent(evt: SecurityAuditEvent): void {
  const p = auditLogPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, `${JSON.stringify(evt)}\n`, 'utf8');
}

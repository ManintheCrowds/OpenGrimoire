import http from 'node:http';
import type { IncomingMessage } from 'node:http';

/** Header Next.js < 14.2.25 used to skip middleware (CVE-2025-29927). */
export const MIDDLEWARE_SUBREQUEST_HEADER = 'x-middleware-subrequest';

const PATCHED = Symbol.for('opengrimoire.stripMiddlewareSubrequest');

type PatchedServer = typeof http.Server.prototype & {
  [PATCHED]?: true;
};

function isIncomingMessage(value: unknown): value is IncomingMessage {
  return typeof value === 'object' && value !== null && 'headers' in value && 'rawHeaders' in value;
}

/**
 * Remove a client-supplied middleware subrequest marker before Next copies headers
 * into the middleware sandbox. 14.2.35 no longer reads this header; stripping it
 * keeps the old bypass from working if a build regresses to the pre-14.2.25 check.
 */
export function stripMiddlewareSubrequestHeader(req: IncomingMessage): void {
  if (Object.prototype.hasOwnProperty.call(req.headers, MIDDLEWARE_SUBREQUEST_HEADER)) {
    delete req.headers[MIDDLEWARE_SUBREQUEST_HEADER];
  }
  const raw = req.rawHeaders;
  for (let i = raw.length - 2; i >= 0; i -= 2) {
    const name = raw[i];
    if (name.toLowerCase() === MIDDLEWARE_SUBREQUEST_HEADER) {
      raw.splice(i, 2);
    }
  }
}

export function installMiddlewareSubrequestStrip(): void {
  const proto = http.Server.prototype as PatchedServer;
  if (proto[PATCHED]) {
    return;
  }
  const originalEmit = proto.emit;
  const patchedEmit: PatchedServer['emit'] = function patchedEmit(event, ...args) {
    if ((event === 'request' || event === 'upgrade') && isIncomingMessage(args[0])) {
      stripMiddlewareSubrequestHeader(args[0]);
    }
    return originalEmit.apply(this, [event, ...args] as Parameters<typeof originalEmit>);
  };
  proto.emit = patchedEmit;
  proto[PATCHED] = true;
}

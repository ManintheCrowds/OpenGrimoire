/**
 * Runs once in the Node server, before it accepts traffic (Next `prepare`).
 * Next 15 loads this file without `experimental.instrumentationHook`.
 * Middleware still executes in Next's edge sandbox, but the HTTP request enters
 * through Node first. Stripping the header here covers dev, `next start`, and
 * the standalone server.
 */
export async function register(): Promise<void> {
  // `next` sets NEXT_RUNTIME=nodejs. The standalone `server.js` entry (Docker)
  // leaves it unset. Skip only the Edge runtime, which does not own the socket.
  if (process.env.NEXT_RUNTIME !== 'edge') {
    // Not a top-level import: Next also compiles this hook for the Edge runtime,
    // and a static `node:http` import fails that compile. Node is the process
    // that accepts the external request.
    const { installMiddlewareSubrequestStrip } = await import('./lib/http/strip-middleware-subrequest');
    installMiddlewareSubrequestStrip();
  }
}

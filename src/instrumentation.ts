/**
 * Runs once in the Node server, before it accepts traffic (Next `prepare`).
 * Middleware still executes in Next's edge sandbox, but the HTTP request enters
 * through Node first — stripping the header here covers dev, `next start`, and
 * the standalone server.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Not a top-level import: Next also compiles this hook for the Edge runtime,
    // and a static `node:http` import fails that compile. Node is the process
    // that accepts the external request.
    const { installMiddlewareSubrequestStrip } = await import('./lib/http/strip-middleware-subrequest');
    installMiddlewareSubrequestStrip();
  }
}

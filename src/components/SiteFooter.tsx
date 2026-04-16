import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer
      className="mt-auto border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600"
      aria-label="Site footer"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1">
        <span>OpenGrimoire</span>
        <Link href="/wiki" className="text-blue-600 hover:underline">
          LLM Wiki mirror
        </Link>
        <Link href="/capabilities" className="text-blue-600 hover:underline">
          API capabilities
        </Link>
        <a href="/api/capabilities" className="text-blue-600 hover:underline">
          GET /api/capabilities (JSON)
        </a>
        <span className="text-gray-400">|</span>
        <span>
          Agent setup: <code className="rounded bg-gray-100 px-1 text-xs">docs/AGENT_INTEGRATION.md</code>
        </span>
      </div>
    </footer>
  );
}

import Link from 'next/link';

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p>
          <strong>Canon = vault:</strong> LLM Wiki prose is authored in your Obsidian vault under{' '}
          <code className="rounded bg-amber-100/80 px-1">LLM-Wiki/</code>. This app only shows a{' '}
          <strong>read-only mirror</strong> from <code className="rounded bg-amber-100/80 px-1">public/wiki</code>
          — never a second source of truth.
        </p>
        <p className="mt-1 text-amber-900/90">
          Sync: see{' '}
          <Link href="/wiki" className="font-medium underline underline-offset-2">
            /wiki
          </Link>{' '}
          index (empty state lists the command) or{' '}
          <a
            className="font-medium underline underline-offset-2"
            href="https://github.com/ManintheCrowds/OpenGrimoire/blob/main/docs/WIKI_MIRROR.md"
          >
            docs/WIKI_MIRROR.md
          </a>{' '}
          in this repo.
        </p>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-6">{children}</div>
    </div>
  );
}

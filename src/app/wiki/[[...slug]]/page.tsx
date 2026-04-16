import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getWikiMirrorRoot,
  listMarkdownRelPaths,
  readWikiMirrorPage,
  wikiMirrorHasAnyMarkdown,
} from '@/lib/wikiMirror';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type PageProps = {
  params: { slug?: string[] };
};

export default async function WikiMirrorPage({ params }: PageProps) {
  const wikiRoot = getWikiMirrorRoot();
  const slug = params.slug ?? [];

  if (slug.length === 0) {
    const hasMd = await wikiMirrorHasAnyMarkdown(wikiRoot);
    const paths = hasMd ? await listMarkdownRelPaths(wikiRoot) : [];

    if (!hasMd) {
      return (
        <div>
          <h1 className="text-2xl font-bold text-slate-900">LLM Wiki mirror</h1>
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800">No mirror content yet</h2>
            <p className="mt-2 text-slate-600">
              Populate <code className="rounded bg-slate-100 px-1">public/wiki</code> with a one-way copy
              from your vault <code className="rounded bg-slate-100 px-1">LLM-Wiki/</code>. Search, edit, and
              graph fusion are intentionally out of scope for this slice.
            </p>
            <p className="mt-4 text-sm font-medium text-slate-700">Single sync command (PowerShell)</p>
            <pre className="mt-2 overflow-x-auto rounded-md bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
{`# From MiscRepos repo root (sibling of this OpenGrimoire clone). Requires vault with LLM-Wiki/Sources.
$env:OBSIDIAN_VAULT_ROOT = "D:/path/to/ObsidianVault"
$env:OPENGRIMOIRE_WIKI_SYNC_OUT = "D:/path/to/OpenGrimoire/public/wiki"
.\\local-proto\\scripts\\Run-LlmWikiScheduledPipeline.ps1 -SyncOpenGrimoireWiki -SkipStagingImport -SkipLint`}
            </pre>
            <p className="mt-4 text-sm text-slate-500">
              See <code className="rounded bg-slate-100 px-1">docs/WIKI_MIRROR.md</code> for details and
              env notes. Then refresh this page.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900">LLM Wiki mirror</h1>
        <p className="mt-1 text-sm text-slate-600">
          {paths.length} page{paths.length === 1 ? '' : 's'} under <code className="rounded bg-slate-100 px-1">public/wiki</code> (cap 400 listed).
        </p>
        <ul className="mt-6 space-y-2">
          {paths.map((rel) => {
            const href = `/wiki/${rel.replace(/\.md$/i, '').split('/').map(encodeURIComponent).join('/')}`;
            return (
              <li key={rel}>
                <Link className="text-blue-700 underline-offset-2 hover:underline" href={href}>
                  {rel}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const doc = await readWikiMirrorPage(slug, wikiRoot);
  if (!doc) {
    notFound();
  }

  const mtime = new Date(doc.mtimeMs).toISOString();

  return (
    <article>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
        <h1 className="text-xl font-semibold text-slate-900">{doc.relPosix}</h1>
        <div className="text-xs text-slate-500">
          Mirror mtime <time dateTime={mtime}>{mtime}</time> · {doc.size} bytes
        </div>
      </div>
      <p className="mb-4 text-sm text-slate-600">
        <Link href="/wiki" className="text-blue-700 underline-offset-2 hover:underline">
          ← All pages
        </Link>
      </p>
      <pre className="whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed text-slate-800 shadow-sm">
        {escapeHtml(doc.content)}
      </pre>
    </article>
  );
}

import Link from 'next/link';

const primaryCards = [
  {
    href: '/operator-intake',
    testId: 'home-card-operator-intake',
    eyebrow: 'Start here',
    title: 'Sync Session',
    description: 'Align human intent with agent memory before the next run.',
  },
  {
    href: '/context-atlas',
    testId: 'nav-link-context-atlas',
    eyebrow: 'Memory map',
    title: 'Context Atlas',
    description: 'Trace how handoffs, vault notes, and archived context cluster together.',
  },
  {
    href: '/admin',
    testId: 'home-card-operator-cockpit',
    eyebrow: 'Operator workbench',
    title: 'Operator Cockpit',
    description: 'Moderation, health, activity, and runbook signals in one control surface.',
  },
];

const utilityCards = [
  {
    href: '/visualization',
    testId: 'nav-link-visualization',
    title: 'Data Constellations',
    description: 'Survey charts, constellation views, and cohort signals.',
  },
  {
    href: '/wiki',
    testId: 'nav-link-wiki-mirror',
    title: 'LLM Wiki',
    description: 'Read-only mirror of the vault; the markdown source stays canonical.',
  },
  {
    href: '/admin/controls',
    testId: 'nav-link-admin-controls',
    title: 'Controls',
    description: 'Theme, color, and operator settings for the local shell.',
    featured: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Local memory forge</p>
          <h1 className="mb-5 text-4xl font-bold text-gray-950">OpenGrimoire</h1>
          <p className="mb-12 text-xl leading-8 text-gray-600">
            A local-first cockpit for aligning intent, reading the archive, and seeing where your software stacks
            converge.
          </p>
        </div>

        <section className="mx-auto max-w-5xl" aria-labelledby="primary-workflows">
          <h2 id="primary-workflows" className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Primary workflows
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {primaryCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group block rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid={card.testId}
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-700">{card.eyebrow}</p>
                <h3 className="mb-3 text-2xl font-semibold text-gray-950">{card.title}</h3>
                <p className="leading-7 text-gray-600">{card.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-5xl" aria-labelledby="supporting-surfaces">
          <h2 id="supporting-surfaces" className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Supporting surfaces
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {utilityCards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`group block rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  card.featured
                    ? 'border-blue-200 bg-blue-50 text-blue-950'
                    : 'border-gray-200 bg-white text-gray-950 hover:border-blue-200'
                }`}
                data-testid={card.testId}
              >
                <h3 className="mb-2 text-xl font-semibold">{card.title}</h3>
                <p className={card.featured ? 'leading-7 text-blue-800' : 'leading-7 text-gray-600'}>
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
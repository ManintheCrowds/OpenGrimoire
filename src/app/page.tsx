import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">OpenGrimoire</h1>
          <p className="text-xl text-gray-600 mb-12">
            Agent context atlas — map how notes and handoffs cluster in your workspace.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link
              href="/visualization"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              data-testid="nav-link-visualization"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Context datasets (D3)</h2>
              <p className="text-gray-600">Sankey, chord, and constellation demos</p>
            </Link>

            <Link
              href="/operator-intake"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              data-testid="nav-link-operator-intake"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Operator intake</h2>
              <p className="text-gray-600">Legacy multi-step sample form (portfolio)</p>
            </Link>

            <Link
              href="/context-atlas"
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              data-testid="nav-link-context-atlas"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Context graph</h2>
              <p className="text-gray-600">Co-access graph from session journals and handoffs</p>
            </Link>

            <Link
              href="/admin/controls"
              className="block p-6 bg-blue-50 border-2 border-blue-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              data-testid="nav-link-admin-controls"
            >
              <h2 className="text-xl font-semibold text-blue-900 mb-2">Global Controls</h2>
              <p className="text-blue-700">Configure colors, themes, and settings (Admin Only)</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
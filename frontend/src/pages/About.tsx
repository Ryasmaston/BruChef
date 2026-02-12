export default function About() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-6">About BruChef</h1>
      <div className="space-y-6 text-slate-300">
        <p>
          BruChef is your personal bartender companion, designed to help you discover,
          create, and perfect cocktail recipes.
        </p>
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-3">Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Browse a curated collection of cocktail recipes</li>
            <li>Search by ingredients, name, or difficulty</li>
            <li>Manage your ingredient inventory</li>
            <li>Create and save custom recipes</li>
          </ul>
        </div>
        <p className="text-sm text-slate-400">
          Built with React, TypeScript, Flask, and PostgreSQL.
        </p>
      </div>
    </div>
  )
}

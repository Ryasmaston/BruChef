import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface CategoryStats {
  classic: number
  community: number
}

export default function Cocktails({ isAuthenticated = false }) {
  const [stats, setStats] = useState<CategoryStats>({ classic: 0, community: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/cocktails/', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch cocktails')
      const data = await response.json()
      const classic = data.filter((c: { is_official: boolean }) => c.is_official).length
      const community = data.filter((c: { is_official: boolean }) => !c.is_official).length
      setStats({ classic, community })
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    {
      slug: 'classic',
      label: 'Classic Cocktails',
      description: 'Timeless recipes curated by our team — the definitive canon of great drinks.',
      count: stats.classic,
      detail: 'Curated by BruChef',
      borderClass: 'hover:border-emerald-500',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      arrowClass: 'text-emerald-400 group-hover:text-emerald-300',
    },
    {
      slug: 'community',
      label: 'Community Cocktails',
      description: 'Approved creations from our members — original recipes reviewed and verified.',
      count: stats.community,
      detail: 'Community verified',
      borderClass: 'hover:border-sky-500',
      badgeClass: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
      arrowClass: 'text-sky-400 group-hover:text-sky-300',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-calivorne text-white">Cocktails</h1>
        <p className="text-slate-400 text-lg font-light">Choose a collection to explore</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/cocktails/category/${cat.slug}`}
            className={`group relative bg-slate-800 rounded-xl border border-slate-700 ${cat.borderClass} hover:shadow-xl transition-all duration-300 overflow-hidden p-8 flex flex-col gap-5`}
          >
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_70%_20%,white,transparent_60%)] pointer-events-none" />
            <div className="flex items-start justify-between">
              {loading ? (
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${cat.badgeClass} animate-pulse w-20 h-6`} />
              ) : (
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${cat.badgeClass}`}>
                  {cat.count} {cat.count === 1 ? 'cocktail' : 'cocktails'}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-calivorne text-white">
                {cat.label}
              </h2>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                {cat.description}
              </p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700">
              <span className="text-xs text-slate-500">{cat.detail}</span>
              <span className={`text-sm font-medium ${cat.arrowClass} transition-colors flex items-center gap-1`}>
                Browse{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center">
        <Link
          to="/cocktails/all"
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4"
        >
          Browse all cocktails
        </Link>
      </div>
    </div>
  )
}

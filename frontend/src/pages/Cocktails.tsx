import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Cocktail {
  id: number
  name: string
  description: string
  difficulty: string
  glass_type: string
  garnish: string
}

export default function Cocktails() {
  const [cocktails, setCocktails] = useState<Cocktail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  useEffect(() => {
    fetchCocktails()
  }, [])

  const fetchCocktails = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/cocktails/')
      if (!response.ok) throw new Error('Failed to fetch cocktails')
      const data = await response.json()
      setCocktails(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load cocktails')
      setLoading(false)
      console.error(err)
    }
  }
  const filteredCocktails = cocktails.filter(cocktail => {
    const matchesSearch = cocktail.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'all' || cocktail.difficulty === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🍸</div>
          <p className="text-slate-400">Loading cocktails...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchCocktails}
            className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Cocktails</h1>
          <p className="text-slate-400 mt-1">
            {filteredCocktails.length} {filteredCocktails.length === 1 ? 'cocktail' : 'cocktails'}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search cocktails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>
      {filteredCocktails.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-400">No cocktails found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-emerald-400 hover:text-emerald-300"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCocktails.map((cocktail) => (
            <Link
              key={cocktail.id}
              to={`/cocktails/${cocktail.id}`}
              className="bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors overflow-hidden group"
            >
              <div className={`h-48 ${getDifficultyColor(cocktail.difficulty)} flex items-center justify-center`}>
                <span className="text-6xl">🍹</span>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {cocktail.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(
                      cocktail.difficulty
                    )}`}
                  >
                    {cocktail.difficulty}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                  {cocktail.description || 'No description available'}
                </p>
                <div className="space-y-2 text-sm">
                  {cocktail.glass_type && (
                    <div className="flex items-center text-slate-500">
                      <span className="mr-2">🥃</span>
                      <span>{cocktail.glass_type}</span>
                    </div>
                  )}
                  {cocktail.garnish && (
                    <div className="flex items-center text-slate-500">
                      <span className="mr-2">🍋</span>
                      <span className="line-clamp-1">{cocktail.garnish}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <span className="text-emerald-400 text-sm group-hover:text-emerald-300">
                    View Recipe →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface Cocktail {
  id: number
  name: string
  description: string
  difficulty: string
  glass_type: string
  garnish: string
  ingredients?: Array<{
    id: number
    name: string
    category: string
  }>
  favourited_by: number[]
}

interface CocktailProps {
  isAuthenticated?: boolean
}

export default function Cocktails({isAuthenticated = false}: CocktailProps) {
  const [cocktails, setCocktails] = useState<Cocktail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [spiritFilter, setSpiritFilter] = useState<string>('all')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [favouriting, setFavouriting] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchCocktails()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/check', {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.authenticated && data.user) {
        setCurrentUserId(data.user.id)
      }
    } catch {
      setCurrentUserId(null)
    }
  }

  const fetchCocktails = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/cocktails/', {
        credentials: 'include'
      })
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
    const matchesSearch = searchQuery === '' ||
      cocktail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cocktail.ingredients && cocktail.ingredients.some(ing =>
        ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    const matchesDifficulty = difficultyFilter === 'all' || cocktail.difficulty === difficultyFilter
    const matchesSpirit = spiritFilter === 'all' ||
      (cocktail.ingredients && cocktail.ingredients.some(ing =>
        ing.category === 'Spirit' &&
        (spiritFilter === 'Spirit' || ing.name.toLowerCase().includes(spiritFilter.toLowerCase()))
      ))
    return matchesSearch && matchesDifficulty && matchesSpirit
  })

  const availableSpirits = Array.from(
    new Set(
      cocktails.flatMap(cocktail =>
        cocktail.ingredients
          ?.filter(ing => ing.category === 'Spirit')
          .map(ing => ing.name) || []
      )
    )
  ).sort()

  const handleToggleFavourite = async (e: React.MouseEvent, cocktailId: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!currentUserId) return
    const cocktail = cocktails.find(c => c.id === cocktailId)
    if (!cocktail) return
    const isFavourited = cocktail.favourited_by.includes(currentUserId)
    setFavouriting(prev => new Set(prev).add(cocktailId))
    setCocktails(prev => prev.map(c =>
      c.id === cocktailId
        ? {
            ...c,
            favourited_by: isFavourited
              ? c.favourited_by.filter(id => id !== currentUserId)
              : [...c.favourited_by, currentUserId]
          }
        : c
    ))
    try {
      const response = await fetch(`http://localhost:5001/api/cocktails/${cocktailId}/favourite`, {
        method: isFavourited ? 'DELETE' : 'POST',
        credentials: 'include'
      })
      if (!response.ok) {
        setCocktails(prev => prev.map(c =>
          c.id === cocktailId
            ? {
                ...c,
                favourited_by: isFavourited
                  ? [...c.favourited_by, currentUserId]
                  : c.favourited_by.filter(id => id !== currentUserId)
              }
            : c
        ))
      }
    } catch {
      setCocktails(prev => prev.map(c =>
        c.id === cocktailId
          ? {
              ...c,
              favourited_by: isFavourited
                ? [...c.favourited_by, currentUserId]
                : c.favourited_by.filter(id => id !== currentUserId)
            }
          : c
      ))
    } finally {
      setFavouriting(prev => {
        const next = new Set(prev)
        next.delete(cocktailId)
        return next
      })
    }
  }

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

  const clearFilters = () => {
    setSearchQuery('')
    setDifficultyFilter('all')
    setSpiritFilter('all')
  }

  const hasActiveFilters = searchQuery !== '' || difficultyFilter !== 'all' || spiritFilter !== 'all'

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
            {hasActiveFilters && <span className="text-emerald-400"> (filtered)</span>}
          </p>
        </div>
        {isAuthenticated ? (
          <Link
            to="/cocktails/new"
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>New Cocktail</span>
          </Link>
        ) : (
          <div className="text-sm text-slate-500">
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300">
              Sign in
            </Link>
            {' '}to create cocktails
          </div>
        )}
      </div>
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Search by name or ingredient
            </label>
            <input
              type="text"
              placeholder="e.g., Margarita or Vodka"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="lg:w-64">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Filter by spirit
            </label>
            <select
              value={spiritFilter}
              onChange={(e) => setSpiritFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Spirits</option>
              {availableSpirits.map(spirit => (
                <option key={spirit} value={spirit}>{spirit}</option>
              ))}
            </select>
          </div>
          <div className="lg:w-48">
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Difficulty
            </label>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <button
              onClick={clearFilters}
              className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition-colors"
            >
              <span>✕</span>
              <span>Clear all filters</span>
            </button>
          </div>
        )}
      </div>
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 text-sm flex items-center gap-2">
              <span>Search: "{searchQuery}"</span>
              <button
                onClick={() => setSearchQuery('')}
                className="hover:text-emerald-300"
              >
                ✕
              </button>
            </div>
          )}
          {spiritFilter !== 'all' && (
            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 text-sm flex items-center gap-2">
              <span>Spirit: {spiritFilter}</span>
              <button
                onClick={() => setSpiritFilter('all')}
                className="hover:text-emerald-300"
              >
                ✕
              </button>
            </div>
          )}
          {difficultyFilter !== 'all' && (
            <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full text-emerald-400 text-sm flex items-center gap-2">
              <span>Difficulty: {difficultyFilter}</span>
              <button
                onClick={() => setDifficultyFilter('all')}
                className="hover:text-emerald-300"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      )}
      {filteredCocktails.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-400 mb-4">No cocktails found</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-emerald-400 hover:text-emerald-300"
            >
              Clear all filters
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
              <div className="h-48 bg-gradient-to-br from-emerald-900/50 to-slate-800 flex items-center justify-center relative">
                <span className="text-6xl">🍹</span>
                {currentUserId && (
                  <button
                    onClick={(e) => handleToggleFavourite(e, cocktail.id)}
                    disabled={favouriting.has(cocktail.id)}
                    className="absolute top-3 right-3 text-yellow-400 hover:text-yellow-300 disabled:opacity-50 transition-colors"
                    title={cocktail.favourited_by.includes(currentUserId) ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill={cocktail.favourited_by.includes(currentUserId) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                )}
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
                {searchQuery && cocktail.ingredients && (
                  <div className="mb-3">
                    <div className="text-xs text-slate-500 mb-1">Contains:</div>
                    <div className="flex flex-wrap gap-1">
                      {cocktail.ingredients
                        .filter(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, 3)
                        .map(ing => (
                          <span
                            key={ing.id}
                            className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded"
                          >
                            {ing.name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
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

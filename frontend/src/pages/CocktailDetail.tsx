import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

interface Cocktail {
  id: number
  name: string
  description: string
  instructions: string
  difficulty: string
  glass_type: string
  garnish: string
  created_at: string
  ingredients: Ingredient[]
}

interface Ingredient {
  id: number
  name: string
  category: string
  abv: number
}

export default function CocktailDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cocktail, setCocktail] = useState<Cocktail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCocktail()
  }, [id])

  const fetchCocktail = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/cocktails/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cocktail not found')
        }
        throw new Error('Failed to fetch cocktail')
      }
      const data = await response.json()
      setCocktail(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load cocktail')
      setLoading(false)
      console.error(err)
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

  const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'Spirit':
          return '🥃'
        case 'Liqueur':
          return '🍾'
        case 'Mixer':
          return '🧃'
        case 'Garnish':
          return '🍋'
        default:
          return '🧪'
      }
    }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🍸</div>
          <p className="text-slate-400">Loading cocktail...</p>
        </div>
      </div>
    )
  }
  if (error || !cocktail) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to="/cocktails"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white inline-block"
          >
            ← Back to Cocktails
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/cocktails')}
        className="mb-6 text-slate-400 hover:text-white flex items-center space-x-2"
      >
        <span>←</span>
        <span>Back to Cocktails</span>
      </button>
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-900/50 to-slate-800 p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">
                {cocktail.name}
              </h1>
              {cocktail.description && (
                <p className="text-xl text-slate-300 mb-4">
                  {cocktail.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 text-sm rounded border ${getDifficultyColor(
                    cocktail.difficulty
                  )}`}
                >
                  {cocktail.difficulty}
                </span>
                {cocktail.glass_type && (
                  <span className="px-3 py-1 text-sm rounded border bg-slate-700/50 text-slate-300 border-slate-600">
                    🥃 {cocktail.glass_type}
                  </span>
                )}
              </div>
            </div>
            <div className="text-8xl ml-4">🍹</div>
          </div>
        </div>
        <div className="p-8 space-y-8">
          {cocktail.ingredients && cocktail.ingredients.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <span className="mr-2">🍎</span>
                What You'll Need
              </h2>
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cocktail.ingredients.map((ingredient) => (
                    <div
                      key={ingredient.id}
                      className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <span className="text-2xl">{getCategoryIcon(ingredient.category)}</span>
                      <div className="flex-1">
                        <div className="text-white font-medium">{ingredient.name}</div>
                        <div className="text-xs text-slate-500">{ingredient.category}</div>
                      </div>
                      {ingredient.abv > 0 && (
                        <span className="text-xs text-slate-400">{ingredient.abv}% ABV</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {cocktail.garnish && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <span className="mr-2">🍋</span>
                Garnish
              </h2>
              <p className="text-slate-300 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                {cocktail.garnish}
              </p>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <span className="mr-2">📖</span>
              Instructions
            </h2>
            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <div className="space-y-3">
                {cocktail.instructions.split('\n').map((step, index) => (
                  <div key={index} className="flex space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-semibold border border-emerald-500/50">
                      {index + 1}
                    </span>
                    <p className="text-slate-300 flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-700">
            <div className="text-sm text-slate-500">
              Added {new Date(cocktail.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <Link
          to="/cocktails"
          className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-center transition-colors"
        >
          Browse More Cocktails
        </Link>
      </div>
    </div>
  )
}

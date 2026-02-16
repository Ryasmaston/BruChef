import { useEffect, useState } from 'react'

interface Ingredient {
  id: number
  name: string
  category: string
  description: string
  abv: number
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  useEffect(() => {
    fetchIngredients()
    fetchCategories()
  }, [])

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/ingredients/')
      if (!response.ok) throw new Error('Failed to fetch ingredients')
      const data = await response.json()
      setIngredients(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load ingredients')
      setLoading(false)
      console.error(err)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ingredients/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    }
  }
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || ingredient.category === categoryFilter
    return matchesSearch && matchesCategory
  })

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
        return '🍎'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Spirit':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50'
      case 'Liqueur':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'Mixer':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'Garnish':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🧪</div>
          <p className="text-slate-400">Loading ingredients...</p>
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
            onClick={fetchIngredients}
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
          <h1 className="text-3xl font-bold text-white">Ingredients</h1>
          <p className="text-slate-400 mt-1">
            {filteredIngredients.length} {filteredIngredients.length === 1 ? 'ingredient' : 'ingredients'}
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map(category => {
          const count = ingredients.filter(i => i.category === category).length
          return (
            <div
              key={category}
              className="bg-slate-800 rounded-lg p-4 text-center border border-slate-700"
            >
              <div className="text-2xl mb-1">{getCategoryIcon(category)}</div>
              <div className="text-xl font-bold text-white">{count}</div>
              <div className="text-xs text-slate-400">{category}</div>
            </div>
          )
        })}
      </div>
      {filteredIngredients.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-400">No ingredients found</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="bg-slate-800 rounded-lg border border-slate-700 p-5 hover:border-emerald-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getCategoryIcon(ingredient.category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {ingredient.name}
                    </h3>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded border mt-1 ${getCategoryColor(
                        ingredient.category
                      )}`}
                    >
                      {ingredient.category}
                    </span>
                  </div>
                </div>
              </div>
              {ingredient.description && (
                <p className="text-slate-400 text-sm mb-3">
                  {ingredient.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <span className="text-sm text-slate-500">ABV</span>
                <span className="text-sm font-semibold text-white">
                  {ingredient.abv}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

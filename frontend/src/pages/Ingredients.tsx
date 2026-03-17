import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePagination } from '../hooks/usePagination'
import Pagination from '../components/Pagination'

interface Ingredient {
  id: number
  name: string
  category: string
  subcategory: string | null
  description: string
  abv: number
  parent_id: number | null
  parent_name: string | null
  is_base: boolean
  children_count: number
}

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const [showBaseOnly, setShowBaseOnly] = useState(false)

  useEffect(() => {
    fetchIngredients()
    fetchCategories()
  }, [])

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/ingredients/')
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
      const response = await fetch('http://localhost:5001/api/ingredients/categories')
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
    const matchesBase = !showBaseOnly || ingredient.is_base
    return matchesSearch && matchesCategory && matchesBase
  })

  const { currentPage, totalPages, paginatedItems, goToPage, reset } = usePagination(filteredIngredients, 12)
  useEffect(() => { reset() }, [searchQuery, categoryFilter, showBaseOnly])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Spirit':
        return '🥃'
      case 'Liqueur':
        return '🍾'
      case 'Wine':
        return '🍷'
      case 'Bitters':
        return '💧'
      case 'Juice':
        return '🧃'
      case 'Syrup':
        return '🍯'
      case 'Soda':
        return '🥤'
      case 'Dairy':
        return '🥛'
      case 'Egg':
        return '🥚'
      case 'Fresh Ingredient':
        return '🌿'
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
      case 'Wine':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'Bitters':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'Juice':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Syrup':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'Soda':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'Dairy':
        return 'bg-slate-300/20 text-slate-300 border-slate-300/50'
      case 'Egg':
        return 'bg-amber-200/20 text-amber-200 border-amber-200/50'
      case 'Fresh Ingredient':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
      case 'Garnish':
        return 'bg-lime-500/20 text-lime-400 border-lime-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🍎</div>
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
            {totalPages > 1 && (
              <span className="text-slate-500"> — page {currentPage} of {totalPages}</span>
            )}
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
        <div className="flex gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {(() => {
              const sorted = [...categories].sort((a, b) =>
                a.localeCompare(b, undefined, { sensitivity: 'base' })
              )
              if (categoryFilter !== 'all') {
                return [
                  categoryFilter,
                  ...sorted.filter(category => category !== categoryFilter),
                ].map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))
              }
              return sorted.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))
            })()}
          </select>
          <button
            onClick={() => setShowBaseOnly(prev => !prev)}
            className={`px-4 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap ${
              showBaseOnly
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            {showBaseOnly ? 'Base only' : 'All ingredients'}
          </button>
        </div>
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
          {paginatedItems.map((ingredient) => (
            <Link
              key={ingredient.id}
              to={`/ingredients/${ingredient.id}`}
              className="bg-slate-800 rounded-lg border border-slate-700 p-5 hover:border-emerald-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getCategoryIcon(ingredient.category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {ingredient.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className={`inline-block px-2 py-1 text-xs rounded border ${getCategoryColor(ingredient.category)}`}>
                        {ingredient.category}
                      </span>
                      {ingredient.subcategory && (
                        <span className="inline-block px-2 py-1 text-xs rounded border bg-slate-700/50 text-slate-300 border-slate-600">
                          {ingredient.subcategory}
                        </span>
                      )}
                      {ingredient.is_base && (
                        <span className="inline-block px-2 py-1 text-xs rounded border bg-blue-500/20 text-blue-400 border-blue-500/30">
                          Base
                        </span>
                      )}
                      {ingredient.parent_name && (
                        <span className="inline-block px-2 py-1 text-xs rounded border bg-slate-700/50 text-slate-400 border-slate-600">
                          ↑ {ingredient.parent_name}
                        </span>
                      )}
                      {ingredient.children_count > 0 && (
                        <span className="inline-block px-2 py-1 text-xs rounded border bg-slate-700/50 text-slate-400 border-slate-600">
                          {ingredient.children_count} variant{ingredient.children_count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {ingredient.description && (
                <p className="text-slate-400 text-sm mb-3 line-clamp-2 italic">
                  {ingredient.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                <span className="text-sm text-slate-500">ABV</span>
                <span className="text-sm font-semibold text-white">
                  {ingredient.abv}%
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700">
                <span className="text-emerald-400 text-sm group-hover:text-emerald-300">
                  View Details →
                </span>
              </div>
            </Link>
          ))}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  )
}

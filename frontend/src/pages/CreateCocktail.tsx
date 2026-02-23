import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

interface Ingredient {
  id: number
  name: string
  category: string
  abv: number
}

interface CreateCocktailProps {
  isAuthenticated: boolean
}

export default function CreateCocktail({ isAuthenticated }: CreateCocktailProps) {
  const navigate = useNavigate()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructions: '',
    glass_type: '',
    garnish: '',
    difficulty: 'Medium',
    ingredient_ids: [] as number[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchIngredients()
  }, [])

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/ingredients/')
      if (!response.ok) throw new Error('Failed to fetch ingredients')
      const data = await response.json()
      setIngredients(data)
    } catch (err) {
      console.error('Error fetching ingredients:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/cocktails/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create cocktail')
      }
      navigate(`/cocktails/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create cocktail')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const toggleIngredient = (ingredientId: number) => {
    setFormData(prev => ({
      ...prev,
      ingredient_ids: prev.ingredient_ids.includes(ingredientId)
        ? prev.ingredient_ids.filter(id => id !== ingredientId)
        : [...prev.ingredient_ids, ingredientId]
    }))
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
        return '🍎'
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400 mb-6">
            You need to be signed in to create cocktails.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link
          to="/cocktails"
          className="text-slate-400 hover:text-white flex items-center space-x-2"
        >
          <span>←</span>
          <span>Back to Cocktails</span>
        </Link>
      </div>
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Create New Cocktail</h1>
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded text-red-400">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Cocktail Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="e.g., Mojito"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="A refreshing rum-based cocktail..."
            />
          </div>
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-slate-300 mb-2">
              Instructions *
            </label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="1. Muddle mint leaves with sugar and lime juice&#10;2. Add rum and ice&#10;3. Top with soda water"
            />
            <p className="mt-1 text-xs text-slate-500">
              Separate steps with new lines
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="glass_type" className="block text-sm font-medium text-slate-300 mb-2">
                Glass Type
              </label>
              <input
                type="text"
                id="glass_type"
                name="glass_type"
                value={formData.glass_type}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                placeholder="e.g., Highball, Rocks"
              />
            </div>
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-slate-300 mb-2">
                Difficulty
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="garnish" className="block text-sm font-medium text-slate-300 mb-2">
              Garnish
            </label>
            <input
              type="text"
              id="garnish"
              name="garnish"
              value={formData.garnish}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="e.g., Mint sprig, lime wheel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Ingredients ({formData.ingredient_ids.length} selected)
            </label>
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ingredients.map((ingredient) => (
                  <label
                    key={ingredient.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      formData.ingredient_ids.includes(ingredient.id)
                        ? 'bg-emerald-500/20 border border-emerald-500/50'
                        : 'bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.ingredient_ids.includes(ingredient.id)}
                      onChange={() => toggleIngredient(ingredient.id)}
                      className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-xl">{getCategoryIcon(ingredient.category)}</span>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{ingredient.name}</div>
                      <div className="text-xs text-slate-500">{ingredient.category}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Creating...' : 'Create Cocktail'}
            </button>
            <Link
              to="/cocktails"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

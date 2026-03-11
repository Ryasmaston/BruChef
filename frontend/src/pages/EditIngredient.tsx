import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'

interface EditIngredientProps {
  isAuthenticated: boolean
}

const CATEGORIES: Record<string, string[]> = {
  'Spirit': ['Vodka', 'Gin', 'Rum', 'Tequila', 'Mezcal', 'Whiskey', 'Bourbon', 'Scotch', 'Brandy', 'Cognac', 'Other Spirit'],
  'Liqueur': ['Orange', 'Coffee', 'Herbal', 'Cream', 'Fruit', 'Nut', 'Chocolate', 'Other Liqueur'],
  'Wine': ['Sparkling', 'Red', 'White', 'Rosé', 'Fortified', 'Other Wine'],
  'Bitters': ['Aromatic', 'Orange', 'Herbal', 'Other Bitters'],
  'Juice': ['Citrus', 'Berry', 'Tropical', 'Vegetable', 'Other Juice'],
  'Syrup': ['Simple', 'Flavored', 'Honey', 'Agave', 'Grenadine', 'Other Syrup'],
  'Soda': ['Club Soda', 'Tonic', 'Ginger Beer', 'Ginger Ale', 'Cola', 'Other Soda'],
  'Dairy': ['Cream', 'Milk', 'Coconut Cream', 'Other Dairy'],
  'Egg': ['Egg White', 'Egg Yolk', 'Whole Egg'],
  'Fresh Ingredient': ['Herb', 'Fruit', 'Vegetable', 'Spice', 'Other Fresh'],
  'Garnish': ['Citrus', 'Berry', 'Olive', 'Cherry', 'Herb', 'Salt/Sugar', 'Other Garnish'],
  'Other': ['Uncategorized']
}

export default function EditIngredient({ isAuthenticated }: EditIngredientProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    category: 'Spirit',
    subcategory: CATEGORIES['Spirit'][0],
    description: '',
    abv: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }
    fetchIngredient()
  }, [id, isAuthenticated])
  const fetchIngredient = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/ingredients/${id}`)
      if (!response.ok) {
        throw new Error('Ingredient not found')
      }
      const data = await response.json()
      setFormData({
        name: data.name,
        category: data.category,
        subcategory: data.subcategory || CATEGORIES[data.category][0],
        description: data.description || '',
        abv: data.abv?.toString() || ''
      })
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load ingredient')
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const response = await fetch(`http://localhost:5001/api/ingredients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update ingredient')
      }
      navigate(`/ingredients/${id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to update ingredient')
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        subcategory: CATEGORIES[value][0]
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400 mb-6">
            You need to be signed in to edit ingredients.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🍎</div>
          <p className="text-slate-400">Loading ingredient...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to={`/ingredients/${id}`} className="text-slate-400 hover:text-white flex items-center space-x-2">
          <span>←</span>
          <span>Back to Ingredient</span>
        </Link>
      </div>

      <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
        <h1 className="text-3xl font-bold text-white mb-6">Edit Ingredient</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Ingredient Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="e.g., Elderflower Liqueur"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              {Object.keys(CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-slate-300 mb-2">
              Subcategory *
            </label>
            <select
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES[formData.category].map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="abv" className="block text-sm font-medium text-slate-300 mb-2">
              ABV (%)
            </label>
            <input
              type="number"
              id="abv"
              name="abv"
              value={formData.abv}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="e.g. 40"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              placeholder="A floral, sweet liqueur..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              to={`/ingredients/${id}`}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

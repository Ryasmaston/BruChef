import { useState, useEffect } from 'react'

interface Ingredient {
  id: number
  name: string
  category: string
  subcategory: string | null
  abv: number
  parent_id: number | null
  parent_name: string | null
  is_base: boolean
  similarity_score?: number
  preferred_unit: string | null
  preferred_mode: 'measured' | 'instructional'
}

interface IngredientCreateModalProps {
  isOpen: boolean
  initialName: string
  onClose: () => void
  onCreated: (ingredient: Ingredient) => void
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

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Spirit': return '🥃'
    case 'Liqueur': return '🍾'
    case 'Wine': return '🍷'
    case 'Bitters': return '💧'
    case 'Juice': return '🧃'
    case 'Syrup': return '🍯'
    case 'Soda': return '🥤'
    case 'Dairy': return '🥛'
    case 'Egg': return '🥚'
    case 'Fresh Ingredient': return '🌿'
    case 'Garnish': return '🍋'
    default: return '🍎'
  }
}

type Step = 'similarity' | 'create'

export default function IngredientCreateModal({
  isOpen,
  initialName,
  onClose,
  onCreated
}: IngredientCreateModalProps) {
  const [step, setStep] = useState<Step>('similarity')
  const [similarIngredients, setSimilarIngredients] = useState<Ingredient[]>([])
  const [loadingSimilar, setLoadingSimilar] = useState(false)
  const [formData, setFormData] = useState({
    name: initialName,
    category: 'Spirit',
    subcategory: CATEGORIES['Spirit'][0],
    description: '',
    abv: '',
    parent_id: null as number | null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && initialName) {
      setStep('similarity')
      setError('')
      setFormData({
        name: initialName,
        category: 'Spirit',
        subcategory: CATEGORIES['Spirit'][0],
        description: '',
        abv: '',
        parent_id: null
      })
      fetchSimilar(initialName)
    }
  }, [isOpen, initialName])

  const fetchSimilar = async (name: string) => {
    setLoadingSimilar(true)
    try {
      const response = await fetch(
        `http://localhost:5001/api/ingredients/similar?name=${encodeURIComponent(name)}`,
        { credentials: 'include' }
      )
      if (!response.ok) throw new Error('Failed to fetch similar ingredients')
      const data = await response.json()
      setSimilarIngredients(data)
    } catch (err) {
      setSimilarIngredients([])
    } finally {
      setLoadingSimilar(false)
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/ingredients/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          subcategory: formData.subcategory,
          description: formData.description,
          abv: formData.abv ? parseFloat(formData.abv) : 0,
          parent_id: formData.parent_id
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create ingredient')
      onCreated(data)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create ingredient')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setStep('similarity')
    setSimilarIngredients([])
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">

        {step === 'similarity' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Create New Ingredient</h2>

            {loadingSimilar ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">Checking for similar ingredients...</p>
              </div>
            ) : similarIngredients.length > 0 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Similar ingredients already exist
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg">
                    {similarIngredients.map((ingredient) => (
                      <button
                        key={ingredient.id}
                        onClick={() => onCreated(ingredient)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors flex items-center space-x-3"
                      >
                        <span className="text-xl">{getCategoryIcon(ingredient.category)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-white text-sm font-medium">{ingredient.name}</span>
                            {ingredient.is_base && (
                              <span className="px-1.5 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                Base
                              </span>
                            )}
                            {ingredient.parent_name && (
                              <span className="px-1.5 py-0.5 text-xs rounded bg-slate-700 text-slate-400 border border-slate-600">
                                {ingredient.parent_name}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            {ingredient.category}
                            {ingredient.subcategory && ` • ${ingredient.subcategory}`}
                            {ingredient.abv > 0 && ` • ${ingredient.abv}% ABV`}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 flex-shrink-0">
                          {Math.round((ingredient.similarity_score || 0) * 100)}% match
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Select one above to use it, or continue below to create a new ingredient.
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-800 px-3 text-slate-500">none of these match</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg text-center">
                <p className="text-sm text-slate-400">No similar ingredients found.</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep('create')}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
              >
                Create "{initialName}"
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {step === 'create' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('similarity')}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ←
              </button>
              <h2 className="text-2xl font-bold text-white">Create New Ingredient</h2>
            </div>

            {formData.parent_id && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <div className="text-white font-medium text-sm">
                      Variant of: {similarIngredients.find(i => i.id === formData.parent_id)?.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      Linked to base ingredient
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Elderflower Liqueur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Parent Ingredient
                  <span className="text-slate-500 font-normal ml-2">(optional)</span>
                </label>
                <select
                  name="parent_id"
                  value={formData.parent_id ?? ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parent_id: e.target.value ? parseInt(e.target.value) : null
                  }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">No parent (create as base)</option>
                  {similarIngredients
                    .filter(i => i.is_base)
                    .map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))
                  }
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
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
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subcategory *
                </label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES[formData.category].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ABV (%)
                </label>
                <input
                  type="number"
                  name="abv"
                  value={formData.abv}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 40"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  placeholder="A floral, sweet liqueur..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Ingredient'}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

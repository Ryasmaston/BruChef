import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

interface Ingredient {
  id: number
  name: string
  category: string
  subcategory: string | null
  abv: number
}

interface IngredientQuantity {
  id: number
  amount: string
  unitType: 'volume'|'mass'|'count'
  unit: string
}

interface CreateCocktailProps {
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

const UNIT_OPTIONS = {
  volume: ['ml', 'L', 'oz', 'cup', 'tsp', 'tbsp', 'dash', 'splash'],
  mass: ['g', 'kg', 'lb', 'oz(weight)'],
  count: ['pieces', 'bottles', 'leaves', 'slices', 'wedges']
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
    ingredient_quantities: [] as Array<{id: number, quantity: string}>
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showIngredientSearch, setShowIngredientSearch] = useState(false)
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('')
  const [ingredientInputs, setIngredientInputs] = useState<IngredientQuantity[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customIngredient, setCustomIngredient] = useState({
    name: '',
    category: 'Spirit',
    subcategory: CATEGORIES['Spirit'][0],
    description: '',
    abv: 0
  })
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  useEffect(() => {
    fetchIngredients()
  }, [])

  useEffect(() => {
    const quantities = ingredientInputs.map(input => ({
      id: input.id,
      quantity: input.amount && input.unit ? `${input.amount} ${input.unit}` : ''
    }))
    setFormData(prev => ({ ...prev, ingredient_quantities: quantities }))
  }, [ingredientInputs])

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

  const addIngredient = (ingredientId: number) => {
    setIngredientInputs(prev => [...prev, {
      id: ingredientId,
      amount: '',
      unitType: 'volume',
      unit: 'oz'
    }])
  }

  const removeIngredient = (ingredientId: number) => {
    setIngredientInputs(prev => prev.filter(input => input.id !== ingredientId))
  }

  const updateIngredientAmount = (ingredientId: number, amount: string) => {
    setIngredientInputs(prev => prev.map(input =>
      input.id === ingredientId ? { ...input, amount } : input
    ))
  }

  const updateIngredientUnitType = (ingredientId: number, unitType: 'volume' | 'mass' | 'count') => {
    setIngredientInputs(prev => prev.map(input =>
      input.id === ingredientId ? { ...input, unitType, unit: UNIT_OPTIONS[unitType][0] } : input
    ))
  }

  const updateIngredientUnit = (ingredientId: number, unit: string) => {
    setIngredientInputs(prev => prev.map(input =>
      input.id === ingredientId ? { ...input, unit } : input
    ))
  }

  const handleCustomIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === 'abv') {
      setCustomIngredient(prev => ({ ...prev, abv: parseFloat(value) || 0 }))
    } else if (name === 'category') {
      const firstSubcategory = CATEGORIES[value]?.[0]
      setCustomIngredient(prev => ({ ...prev, category: value, subcategory: firstSubcategory }))
    } else {
      setCustomIngredient(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCreateCustomIngredient = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalError('')
    setModalLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/ingredients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(customIngredient)
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ingredient')
      }
      setIngredients(prev => [...prev, data])
      addIngredient(data.id)
      setShowCreateModal(false)
      setShowIngredientSearch(false)
      setIngredientSearchQuery('')
      setCustomIngredient({
        name: '',
        category: 'Spirit',
        subcategory: CATEGORIES['Spirit'][0],
        description: '',
        abv: 0
      })
      setModalLoading(false)
    } catch (err: any) {
      setModalError(err.message || 'Failed to create ingredient')
      setModalLoading(false)
    }
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

  const filteredIngredients = ingredients.filter(ing =>
    ing.name.toLowerCase().includes(ingredientSearchQuery.toLowerCase()) &&
    !formData.ingredient_quantities.some(iq => iq.id === ing.id)
  )

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

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/cocktails" className="text-slate-400 hover:text-white flex items-center space-x-2">
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
              <p className="mt-1 text-xs text-slate-500">Separate steps with new lines</p>
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
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-slate-300">
                  Ingredients ({ingredientInputs.length} selected)
                </label>
                <button
                  type="button"
                  onClick={() => setShowIngredientSearch(true)}
                  className="px-3 py-1 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                >
                  + Add Ingredient
                </button>
              </div>
              {ingredientInputs.length === 0 ? (
                <div className="text-center py-8 bg-slate-900 border border-slate-700 rounded-lg">
                  <p className="text-slate-500 text-sm mb-3">No ingredients added yet</p>
                  <button
                    type="button"
                    onClick={() => setShowIngredientSearch(true)}
                    className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                  >
                    Add First Ingredient
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {ingredientInputs.map((input) => {
                    const ing = ingredients.find(i => i.id === input.id)
                    if (!ing) return null
                    return (
                      <div key={input.id} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-2xl">{getCategoryIcon(ing.category)}</span>
                          <div className="flex-1">
                            <div className="text-white font-medium text-lg">{ing.name}</div>
                            <div className="text-xs text-slate-500">
                              {ing.category}{ing.subcategory && ` • ${ing.subcategory}`}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeIngredient(input.id)}
                            className="px-3 py-1 text-sm bg-red-900/20 text-red-400 rounded border border-red-900/50 hover:bg-red-900/40 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mb-3">
                          <label className="block text-xs font-medium text-slate-400 mb-2">
                            Measurement Type
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => updateIngredientUnitType(input.id, 'volume')}
                              className={`px-3 py-2 text-sm rounded transition-colors ${
                                input.unitType === 'volume'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              Volume
                            </button>
                            <button
                              type="button"
                              onClick={() => updateIngredientUnitType(input.id, 'mass')}
                              className={`px-3 py-2 text-sm rounded transition-colors ${
                                input.unitType === 'mass'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              Mass
                            </button>
                            <button
                              type="button"
                              onClick={() => updateIngredientUnitType(input.id, 'count')}
                              className={`px-3 py-2 text-sm rounded transition-colors ${
                                input.unitType === 'count'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              Count
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                              Amount
                            </label>
                            <input
                              type="number"
                              value={input.amount}
                              onChange={(e) => updateIngredientAmount(input.id, e.target.value)}
                              min="0"
                              step="0.1"
                              placeholder="0"
                              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">
                              Unit
                            </label>
                            <select
                              value={input.unit}
                              onChange={(e) => updateIngredientUnit(input.id, e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-emerald-500"
                            >
                              {UNIT_OPTIONS[input.unitType].map(u => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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
      {showIngredientSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Add Ingredient</h3>
            <input
              type="text"
              value={ingredientSearchQuery}
              onChange={(e) => setIngredientSearchQuery(e.target.value)}
              placeholder="Search ingredients..."
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mb-3"
              autoFocus
            />
            {ingredientSearchQuery ? (
              <>
                {filteredIngredients.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto space-y-1 mb-3">
                    {filteredIngredients.slice(0, 10).map((ing) => (
                      <button
                        key={ing.id}
                        type="button"
                        onClick={() => {
                          addIngredient(ing.id)
                          setShowIngredientSearch(false)
                          setIngredientSearchQuery('')
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-slate-700 rounded flex items-center gap-3 transition-colors"
                      >
                        <span className="text-xl">{getCategoryIcon(ing.category)}</span>
                        <div>
                          <div className="text-white font-medium">{ing.name}</div>
                          <div className="text-xs text-slate-500">{ing.category}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg text-center mb-3">
                    <p className="text-sm text-slate-400 mb-3">No ingredient found with that name</p>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomIngredient(prev => ({ ...prev, name: ingredientSearchQuery }))
                        setShowCreateModal(true)
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded transition-colors"
                    >
                      Create Ingredient
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-500 text-sm">
                Type to search for ingredients
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setShowIngredientSearch(false)
                setIngredientSearchQuery('')
              }}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Ingredient</h2>

            {modalError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-400 text-sm">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateCustomIngredient} className="space-y-4">
              <div>
                <label htmlFor="custom-name" className="block text-sm font-medium text-slate-300 mb-2">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  id="custom-name"
                  name="name"
                  value={customIngredient.name}
                  onChange={handleCustomIngredientChange}
                  required
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Elderflower Liqueur"
                />
              </div>
              <div>
                <label htmlFor="custom-category" className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  id="custom-category"
                  name="category"
                  value={customIngredient.category}
                  onChange={handleCustomIngredientChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {Object.keys(CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="custom-subcategory" className="block text-sm font-medium text-slate-300 mb-2">
                  Subcategory *
                </label>
                <select
                  id="custom-subcategory"
                  name="subcategory"
                  value={customIngredient.subcategory}
                  onChange={handleCustomIngredientChange}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES[customIngredient.category].map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="custom-abv" className="block text-sm font-medium text-slate-300 mb-2">
                  ABV (%)
                </label>
                <input
                  type="number"
                  id="custom-abv"
                  name="abv"
                  value={customIngredient.abv}
                  onChange={handleCustomIngredientChange}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="custom-description" className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="custom-description"
                  name="description"
                  value={customIngredient.description}
                  onChange={handleCustomIngredientChange}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  placeholder="A floral, sweet liqueur..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {modalLoading ? 'Creating...' : 'Create Ingredient'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setModalError('')
                    setCustomIngredient({
                      name: '',
                      category: 'Spirit',
                      subcategory: CATEGORIES['Spirit'][0],
                      description: '',
                      abv: 0
                    })
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

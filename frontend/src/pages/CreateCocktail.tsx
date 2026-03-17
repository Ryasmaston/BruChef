import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import IngredientCreateModal from '../components/IngredientCreateModal'

interface Ingredient {
  id: number
  name: string
  category: string
  subcategory: string | null
  abv: number
  preferred_unit: string | null
  preferred_mode: 'measured' | 'instructional'
}

interface IngredientQuantity {
  id: number
  mode: 'measured' | 'instructional'
  amount: string
  unit: string
  quantity_note: string
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
  volume: ['ml', 'oz', 'cl', 'tsp', 'tbsp', 'cup'],
  mass: ['g', 'kg', 'lb'],
  count: ['pieces', 'cubes', 'leaves', 'slices', 'wedges', 'eggs', 'bottles', 'cans'],
  approximate: ['dashes', 'splashes', 'drops']
}

const INSTRUCTIONAL_OPTIONS = [
  'top with',
  'fill',
  'splash',
  'to taste',
  'muddle',
  'garnish with',
  'other'
]



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
    servings: 1,
    ingredients: [] as Array<{
      ingredient_id: number
      quantity: number | null
      unit: string | null
      quantity_note: string | null
    }>
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showIngredientSearch, setShowIngredientSearch] = useState(false)
  const [ingredientSearchQuery, setIngredientSearchQuery] = useState('')
  const [ingredientInputs, setIngredientInputs] = useState<IngredientQuantity[]>([])
  const [instructionInputs, setInstructionInputs] = useState<string[]>([])
  const [currentInstruction, setCurrentInstruction] = useState('')
  const [editingInstructionIndex, setEditingInstructionIndex] = useState<number | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchIngredients()
  }, [])

  useEffect(() => {
    const mapped = ingredientInputs.map(input => ({
      ingredient_id: input.id,
      quantity: input.mode === 'measured' ? parseFloat(input.amount) || null : null,
      unit: input.mode === 'measured' ? input.unit : null,
      quantity_note: input.mode === 'instructional' ? input.quantity_note : null
    }))
    setFormData(prev => ({ ...prev, ingredients: mapped }))
  }, [ingredientInputs])

  useEffect(() => {
    setFormData(prev => ({
      ...prev, instructions: instructionInputs.join('\n')
    }))
  }, [instructionInputs])

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
    if (ingredientInputs.length === 0) {
      setError('Please add at least one ingredient')
      return
    }
    const missingAmounts = ingredientInputs.filter(input =>
      input.mode === 'measured' && (!input.amount || !input.unit)
    )
    if (missingAmounts.length > 0) {
      setError('Please enter amounts for all measured ingredients')
      return
    }
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
      // console.log("API response:", data)
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
    const ing = ingredients.find(i => i.id === ingredientId)
    if (!ing) return
    setIngredientInputs(prev => [...prev, {
      id: ingredientId,
      mode: ing.preferred_mode,
      amount: '',
      unit: ing.preferred_unit || 'oz',
      quantity_note: ing.preferred_mode === 'instructional' ? 'top with' : ''
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

  const updateIngredientUnit = (ingredientId: number, unit: string) => {
    setIngredientInputs(prev => prev.map(input =>
      input.id === ingredientId ? { ...input, unit } : input
    ))
  }

  const addInstruction = () => {
    if (!currentInstruction.trim()) return
    if (editingInstructionIndex !== null) {
      setInstructionInputs(prev => prev.map((inst, idx) =>
        idx === editingInstructionIndex ? currentInstruction.trim() : inst
      ))
      setEditingInstructionIndex(null)
    } else {
      setInstructionInputs(prev => [...prev, currentInstruction.trim()])
    }
    setCurrentInstruction('')
  }

  const editInstruction = (index: number) => {
    setCurrentInstruction(instructionInputs[index])
    setEditingInstructionIndex(index)
  }

  const deleteInstruction = (index: number) => {
    setInstructionInputs(prev => prev.filter((_, idx) => idx !== index))
  }

  const moveInstructionUp = (index: number) => {
    if (index === 0) return
    setInstructionInputs(prev => {
      const newInstructions = [...prev]
      ;[newInstructions[index - 1], newInstructions[index]] = [newInstructions[index], newInstructions[index - 1]]
      return newInstructions
    })
  }

  const moveInstructionDown = (index: number) => {
    if (index === instructionInputs.length - 1) return
    setInstructionInputs(prev => {
      const newInstructions = [...prev]
      ;[newInstructions[index], newInstructions[index + 1]] = [newInstructions[index + 1], newInstructions[index]]
      return newInstructions
    })
  }

  const cancelEdit = () => {
    setCurrentInstruction('')
    setEditingInstructionIndex(null)
  }

  const updateIngredientMode = (ingredientId: number, mode: 'measured' | 'instructional') => {
    const ing = ingredients.find(i => i.id === ingredientId)
    setIngredientInputs(prev => prev.map(input =>
      input.id === ingredientId
        ? {
            ...input,
            mode,
            quantity_note: mode === 'instructional' ? 'top with' : '',
            unit: mode === 'measured' ? (ing?.preferred_unit || 'oz') : input.unit
          }
        : input
    ))
  }

  const updateIngredientNote = (ingredientId: number, note: string) => {
    setIngredientInputs(prev => prev.map(input =>
      input.id === ingredientId ? { ...input, quantity_note: note } : input
    ))
  }

  const updateIngredientCustomNote = (ingredientId: number, note: string) => {
    setIngredientInputs(prev => prev.map(input =>
      input.id === ingredientId ? { ...input, quantity_note: note } : input
    ))
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
    !formData.ingredients.some(iq => iq.ingredient_id === ing.id)
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
                placeholder="e.g. Mojito"
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
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Instructions *
              </label>
              <div className="mb-4">
                <div className="flex gap-2">
                  <textarea
                    value={currentInstruction}
                    onChange={(e) => setCurrentInstruction(e.target.value)}
                    placeholder="Enter instruction step..."
                    rows={3}
                    className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        e.preventDefault()
                        addInstruction()
                      }
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={addInstruction}
                    disabled={!currentInstruction.trim()}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    {editingInstructionIndex !== null ? 'Update Step' : 'Add Step'}
                  </button>
                  {editingInstructionIndex !== null && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                  <p className="text-xs text-slate-500 self-center ml-2">
                    Press Ctrl+Enter to add
                  </p>
                </div>
              </div>
              {instructionInputs.length === 0 ? (
                <div className="text-center py-8 bg-slate-900 border border-slate-700 rounded-lg">
                  <p className="text-slate-500 text-sm mb-3">No instructions added yet</p>
                  <p className="text-slate-600 text-xs">Add step-by-step instructions above</p>
                </div>
              ) : (
                <div className="space-y-2 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  {instructionInputs.map((instruction, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 p-3 rounded-lg transition-colors ${
                        editingInstructionIndex === index
                          ? 'bg-emerald-900/20 border border-emerald-700/50'
                          : 'bg-slate-800/50 hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-semibold border border-emerald-500/50">
                        {index + 1}
                      </div>
                      <div className="flex-1 text-slate-300 text-sm self-center">
                        {instruction}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => moveInstructionUp(index)}
                          disabled={index === 0}
                          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded transition-colors"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveInstructionDown(index)}
                          disabled={index === instructionInputs.length - 1}
                          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded transition-colors"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => editInstruction(index)}
                          className="px-2 py-1 text-xs bg-blue-900/20 text-blue-400 hover:bg-blue-900/40 rounded border border-blue-900/50 transition-colors"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteInstruction(index)}
                          className="px-2 py-1 text-xs bg-red-900/20 text-red-400 hover:bg-red-900/40 rounded border border-red-900/50 transition-colors"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {instructionInputs.length > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  {instructionInputs.length} step{instructionInputs.length !== 1 ? 's' : ''} added
                </p>
              )}
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
                  placeholder="e.g. Highball, Rocks"
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
              <div>
                <label htmlFor="servings" className="block text-sm font-medium text-slate-300 mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  id="servings"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  min="1"
                  max="20"
                  required
                  placeholder="1"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
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
                placeholder="e.g. Mint sprig, lime wheel"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-slate-300">
                  Ingredients * ({ingredientInputs.length} selected)
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
                            Quantity Type
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => updateIngredientMode(input.id, 'measured')}
                              className={`px-3 py-2 text-sm rounded transition-colors ${
                                input.mode === 'measured'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              Measured
                            </button>
                            <button
                              type="button"
                              onClick={() => updateIngredientMode(input.id, 'instructional')}
                              className={`px-3 py-2 text-sm rounded transition-colors ${
                                input.mode === 'instructional'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                              }`}
                            >
                              Instructional
                            </button>
                          </div>
                        </div>
                        {input.mode === 'measured' ? (
                          <div className="space-y-3">
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
                                  step="0.25"
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
                                  <optgroup label="Volume">
                                    {UNIT_OPTIONS.volume.map(u => <option key={u} value={u}>{u}</option>)}
                                  </optgroup>
                                  <optgroup label="Mass">
                                    {UNIT_OPTIONS.mass.map(u => <option key={u} value={u}>{u}</option>)}
                                  </optgroup>
                                  <optgroup label="Count">
                                    {UNIT_OPTIONS.count.map(u => <option key={u} value={u}>{u}</option>)}
                                  </optgroup>
                                  <optgroup label="Approximate">
                                    {UNIT_OPTIONS.approximate.map(u => <option key={u} value={u}>{u}</option>)}
                                  </optgroup>
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-medium text-slate-400 mb-2">
                              Instruction
                            </label>
                            <select
                              value={INSTRUCTIONAL_OPTIONS.includes(input.quantity_note) ? input.quantity_note : 'other'}
                              onChange={(e) => {
                                if (e.target.value !== 'other') {
                                  updateIngredientNote(input.id, e.target.value)
                                } else {
                                  updateIngredientNote(input.id, '')
                                }
                              }}
                              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-white focus:outline-none focus:border-blue-500 mb-2"
                            >
                              {INSTRUCTIONAL_OPTIONS.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                            {(!INSTRUCTIONAL_OPTIONS.includes(input.quantity_note) || input.quantity_note === 'other' || input.quantity_note === '') && (
                              <input
                                type="text"
                                value={input.quantity_note}
                                onChange={(e) => updateIngredientCustomNote(input.id, e.target.value)}
                                placeholder="e.g. a pinch of, float on top..."
                                className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                              />
                            )}
                            <p className="mt-1 text-xs text-blue-400">
                              Instructional quantities are displayed but not tracked in inventory
                            </p>
                          </div>
                        )}
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
      <IngredientCreateModal
        isOpen={showCreateModal}
        initialName={ingredientSearchQuery}
        onClose={() => {
          setShowCreateModal(false)
        }}
        onCreated={(ingredient) => {
          setIngredients(prev => [...prev, ingredient])
          addIngredient(ingredient.id)
          setShowCreateModal(false)
          setShowIngredientSearch(false)
          setIngredientSearchQuery('')
        }}
      />
    </>
  )
}

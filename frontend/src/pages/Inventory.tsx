import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface InventoryItem {
  id: number
  ingredient_id: number
  ingredient: {
    id: number
    name: string
    category: string
    subcategory: string | null
    abv: number
  }
  quantity: number
  unit: string
  notes: string
  added_at: string
  updated_at: string
}

interface Ingredient {
  id: number
  name: string
  category: string
  subcategory: string | null
  abv: number
}

interface Cocktail {
  id: number
  name: string
  description: string
  difficulty: string
}

interface InventoryProps {
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
  volume: ['ml', 'L', 'oz', 'cup'],
  mass: ['g', 'kg', 'lb', 'oz(weight)'],
  count: ['pieces', 'bottles', 'cans', 'leaves']
}

export default function Inventory({ isAuthenticated }: InventoryProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [availableIngredients, setAvailableIngredients] = useState<Ingredient[]>([])
  const [availableCocktails, setAvailableCocktails] = useState<Cocktail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)
  const [quantity, setQuantity] = useState('750')
  const [unitType, setUnitType] = useState<'volume'|'mass'|'count'>('volume')
  const [unit, setUnit] = useState('ml')
  const [notes, setNotes] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    category: 'Spirit',
    subcategory: CATEGORIES['Spirit'][0],
    description: '',
    abv: ''
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'inventory' | 'available'>('inventory')

  useEffect(() => {
    if (isAuthenticated) {
      fetchInventory()
      fetchIngredients()
      fetchAvailableCocktails()
    }
  }, [isAuthenticated])

  useEffect(() => {
    setUnit(UNIT_OPTIONS[unitType][0])
  }, [unitType])

  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/inventory/', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch inventory')
      const data = await response.json()
      setInventory(data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load inventory')
      setLoading(false)
      console.error(err)
    }
  }

  const fetchIngredients = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/ingredients/')
      if (!response.ok) throw new Error('Failed to fetch ingredients')
      const data = await response.json()
      setAvailableIngredients(data)
    } catch (err) {
      console.error('Error fetching ingredients:', err)
    }
  }

  const fetchAvailableCocktails = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/inventory/available-cocktails', {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch available cocktails')
      const data = await response.json()
      setAvailableCocktails(data)
    } catch (err) {
      console.error('Error fetching available cocktails:', err)
    }
  }

  const handleCreateIngredient = async () => {
    setCreateError('')
    setCreateLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/ingredients/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newIngredient)
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create ingredient')
      }
      setAvailableIngredients(prev => [...prev, data])
      setSelectedIngredient(data)
      setIngredientSearch(data.name)
      setShowCreateModal(false)
      setNewIngredient({
        name: '',
        category: 'Spirit',
        subcategory: CATEGORIES['Spirit'][0],
        description: '',
        abv: ''
      })
      setCreateLoading(false)
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create ingredient')
      setCreateLoading(false)
    }
  }

  const handleAddToInventory = async () => {
    if (!selectedIngredient) return
    setAddLoading(true)
    try {
      const response = await fetch('http://localhost:5001/api/inventory/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ingredient_id: selectedIngredient.id,
          quantity: parseFloat(quantity),
          unit,
          notes
        })
      })
      if (!response.ok) throw new Error('Failed to add to inventory')
      await fetchInventory()
      await fetchAvailableCocktails()
      setShowAddModal(false)
      setSelectedIngredient(null)
      setIngredientSearch('')
      setQuantity('750')
      setUnit('ml')
      setNotes('')
      setAddLoading(false)
    } catch (err: any) {
      alert(err.message || 'Failed to add to inventory')
      setAddLoading(false)
    }
  }

  const handleRemoveFromInventory = async (itemId: number) => {
    if (!confirm('Remove this ingredient from your inventory?')) return
    try {
      const response = await fetch(`http://localhost:5001/api/inventory/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to remove from inventory')
      await fetchInventory()
      await fetchAvailableCocktails()
    } catch (err: any) {
      alert(err.message || 'Failed to remove from inventory')
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/50'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  const filteredInventory = inventory.filter(item =>
    item.ingredient.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredCocktails = availableCocktails.filter(cocktail =>
    cocktail.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ingredientsNotInInventory = availableIngredients.filter(
    ing => !inventory.some(item => item.ingredient_id === ing.id)
  )

  const searchFilteredIngredients = ingredientsNotInInventory.filter(ing =>
    ing.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-slate-400 mb-6">
            You need to be signed in to manage your bar inventory.
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
          <div className="text-4xl mb-4">📦</div>
          <p className="text-slate-400">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">My Inventory</h1>
            <p className="text-slate-400 mt-1">
              Manage your ingredients and discover what you can make
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Ingredient</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-white">{inventory.length}</div>
            <div className="text-slate-400 text-sm">Ingredients in Stock</div>
          </div>
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="text-3xl mb-2">🍸</div>
            <div className="text-2xl font-bold text-emerald-400">{availableCocktails.length}</div>
            <div className="text-slate-400 text-sm">Cocktails You Can Make</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => setViewMode('inventory')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'inventory' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              📦 My Inventory
            </button>
            <button
              onClick={() => setViewMode('available')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'available' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🍸 Available Cocktails
            </button>
          </div>
          <div className="flex-1">
            <input
              type="text"
              placeholder={viewMode === 'inventory' ? "Search ingredients..." : "Search cocktails..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        {viewMode === 'inventory' ? (
          <>
            {filteredInventory.length === 0 ? (
              <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-4xl mb-4">📦</div>
                <p className="text-slate-400 mb-4">
                  {searchQuery ? 'No ingredients found' : 'Your inventory is empty'}
                </p>
                <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors">
                  Add Ingredient
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item) => (
                  <div key={item.id} className="bg-slate-800 rounded-lg border border-slate-700 p-5 hover:border-emerald-500 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">{getCategoryIcon(item.ingredient.category)}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{item.ingredient.name}</h3>
                          <div className="text-xs text-slate-500">
                            {item.ingredient.category}
                            {item.ingredient.subcategory && ` • ${item.ingredient.subcategory}`}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-400">Quantity:</span>
                        <span className="text-sm font-semibold text-emerald-400">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      {item.notes && (
                        <div className="text-xs text-slate-500 italic">"{item.notes}"</div>
                      )}
                    </div>
                    <button onClick={() => handleRemoveFromInventory(item.id)} className="mt-4 w-full px-4 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded border border-red-900/50 text-sm font-medium transition-colors">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {filteredCocktails.length === 0 ? (
              <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <div className="text-4xl mb-4">🍸</div>
                <p className="text-slate-400 mb-4">
                  {searchQuery ? 'No cocktails found' : 'Add more ingredients to discover cocktails you can make!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCocktails.map((cocktail) => (
                  <Link key={cocktail.id} to={`/cocktails/${cocktail.id}`} className="bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors overflow-hidden group">
                    <div className="h-48 bg-gradient-to-br from-emerald-900/50 to-slate-800 flex items-center justify-center">
                      <span className="text-6xl">🍹</span>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">{cocktail.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(cocktail.difficulty)}`}>{cocktail.difficulty}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{cocktail.description || 'No description available'}</p>
                      <div className="flex items-center text-emerald-400 text-sm">
                        <span className="mr-2">✓</span>
                        <span>You have all ingredients!</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Add to Inventory</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Search Ingredient *
                </label>
                <input
                  type="text"
                  value={ingredientSearch}
                  onChange={(e) => {
                    setIngredientSearch(e.target.value)
                    setSelectedIngredient(null)
                  }}
                  placeholder="Type to search ingredients..."
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {ingredientSearch && !selectedIngredient && (
                  <>
                    {searchFilteredIngredients.length > 0 ? (
                      <div className="mt-2 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg">
                        {searchFilteredIngredients.slice(0, 10).map((ing) => (
                          <button
                            key={ing.id}
                            onClick={() => {
                              setSelectedIngredient(ing)
                              setIngredientSearch(ing.name)
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-800 transition-colors flex items-center space-x-3"
                          >
                            <span className="text-xl">{getCategoryIcon(ing.category)}</span>
                            <div className="flex-1">
                              <div className="text-white text-sm font-medium">{ing.name}</div>
                              <div className="text-xs text-slate-500">
                                {ing.category}{ing.subcategory && ` • ${ing.subcategory}`}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2 p-4 bg-slate-900 border border-slate-700 rounded-lg text-center">
                        <p className="text-sm text-slate-400 mb-3">No ingredient found with that name</p>
                        <button
                          onClick={() => {
                            setNewIngredient(prev => ({ ...prev, name: ingredientSearch }))
                            setShowCreateModal(true)
                          }}
                          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded transition-colors"
                        >
                          + Create "{ingredientSearch}"
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              {selectedIngredient && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getCategoryIcon(selectedIngredient.category)}</span>
                    <div>
                      <div className="text-white font-medium">{selectedIngredient.name}</div>
                      <div className="text-xs text-slate-400">
                        {selectedIngredient.category}{selectedIngredient.subcategory && ` • ${selectedIngredient.subcategory}`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Measurement Type *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnitType('volume')}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      unitType === 'volume'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Volume
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitType('mass')}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      unitType === 'mass'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Mass
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnitType('count')}
                    className={`px-4 py-2 text-sm rounded transition-colors ${
                      unitType === 'count'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Count
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Unit
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {UNIT_OPTIONS[unitType].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Half full bottle"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToInventory}
                  disabled={!selectedIngredient || addLoading}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {addLoading ? 'Adding...' : 'Add to Inventory'}
                </button>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedIngredient(null)
                    setIngredientSearch('')
                    setQuantity('750')
                    setUnitType('volume')
                    setUnit('ml')
                    setNotes('')
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Create New Ingredient</h2>
            {createError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-400 text-sm">
                {createError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ingredient Name *
                </label>
                <input
                  type="text"
                  value={newIngredient.name}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Elderflower Liqueur"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  value={newIngredient.category}
                  onChange={(e) => setNewIngredient(prev => ({
                    ...prev,
                    category: e.target.value,
                    subcategory: CATEGORIES[e.target.value][0]
                  }))}
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
                  value={newIngredient.subcategory}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {CATEGORIES[newIngredient.category].map(subcat => (
                    <option key={subcat} value={subcat}>{subcat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  ABV (%)
                </label>
                <input
                  type="number"
                  value={newIngredient.abv}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, abv: e.target.value }))}
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="e.g. 40"
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newIngredient.description}
                  onChange={(e) => setNewIngredient(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  placeholder="A floral, sweet liqueur..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreateIngredient}
                  disabled={!newIngredient.name || createLoading}
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {createLoading ? 'Creating...' : 'Create Ingredient'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateError('')
                    setNewIngredient({
                      name: '',
                      category: 'Spirit',
                      subcategory: CATEGORIES['Spirit'][0],
                      description: '',
                      abv: ''
                    })
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

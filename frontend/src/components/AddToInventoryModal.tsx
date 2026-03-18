import { useState } from 'react'

interface Ingredient {
  id: number
  name: string
  category: string
  subcategory: string | null
  abv: number
  preferred_unit: string | null
  preferred_mode: 'measured' | 'instructional'
}

interface AddToInventoryModalProps {
  isOpen: boolean
  ingredient: Ingredient | null
  onClose: () => void
  onAdded: () => void
}

const UNIT_OPTIONS = {
  volume: ['ml', 'oz'],
  mass: ['g', 'lb'],
  count: ['pieces', 'cubes', 'leaves', 'slices', 'wedges', 'bottles', 'cans']
}

const getUnitType = (unit: string): 'volume' | 'mass' | 'count' => {
  if (UNIT_OPTIONS.mass.includes(unit)) return 'mass'
  if (UNIT_OPTIONS.count.includes(unit)) return 'count'
  return 'volume'
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

export default function AddToInventoryModal({
  isOpen,
  ingredient,
  onClose,
  onAdded
}: AddToInventoryModalProps) {
  const initialUnitType = ingredient?.preferred_unit
    ? getUnitType(ingredient.preferred_unit)
    : 'volume'
  const initialUnit = ingredient?.preferred_unit || 'ml'

  const [quantity, setQuantity] = useState('')
  const [unitType, setUnitType] = useState<'volume' | 'mass' | 'count'>(initialUnitType)
  const [unit, setUnit] = useState(initialUnit)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpen = () => {
    if (ingredient?.preferred_unit) {
      setUnitType(getUnitType(ingredient.preferred_unit))
      setUnit(ingredient.preferred_unit)
    } else {
      setUnitType('volume')
      setUnit('ml')
    }
    setQuantity('')
    setNotes('')
    setError('')
  }

  if (!isOpen || !ingredient) return null

  const handleAdd = async () => {
    if (!quantity) {
      setError('Please enter a quantity')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5001/api/inventory/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ingredient_id: ingredient.id,
          quantity: parseFloat(quantity),
          unit,
          notes
        })
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add to inventory')
      }
      onAdded()
      onClose()
      setQuantity('')
      setNotes('')
    } catch (err: any) {
      setError(err.message || 'Failed to add to inventory')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Add to Inventory</h2>
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/50 rounded-lg mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getCategoryIcon(ingredient.category)}</span>
            <div>
              <div className="text-white font-medium">{ingredient.name}</div>
              <div className="text-xs text-slate-400">
                {ingredient.category}
                {ingredient.subcategory && ` • ${ingredient.subcategory}`}
                {ingredient.abv > 0 && ` • ${ingredient.abv}% ABV`}
              </div>
            </div>
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-400 text-sm">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Measurement Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setUnitType('volume'); setUnit(UNIT_OPTIONS.volume[0]) }}
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
                onClick={() => { setUnitType('mass'); setUnit(UNIT_OPTIONS.mass[0]) }}
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
                onClick={() => { setUnitType('count'); setUnit(UNIT_OPTIONS.count[0]) }}
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
                placeholder="0"
                autoFocus
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
              onClick={handleAdd}
              disabled={loading || !quantity}
              className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Adding...' : 'Add to Inventory'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

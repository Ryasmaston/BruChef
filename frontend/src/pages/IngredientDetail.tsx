import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'
import AlertDialog from '../components/AlertDialog'
import AddToInventoryModal from '../components/AddToInventoryModal'
import CocktailImage from '../components/CocktailImage'

interface Ingredient {
  id: number
  name: string
  category: string
  subcategory: string | null
  description: string
  abv: number
  user_id: number | null
  creator_name: string
  parent_id: number | null
  parent_name: string | null
  is_base: boolean
  children_count: number
  preferred_unit: string | null
}

interface Cocktail {
  id: number
  name: string
  description: string
  difficulty: string
  glass_type: string
  image_url?: string | null
  garnish: string
}

export default function IngredientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ingredient, setIngredient] = useState<Ingredient | null>(null)
  const [cocktails, setCocktails] = useState<Cocktail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [children, setChildren] = useState<Ingredient[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [addedToInventory, setAddedToInventory] = useState(false)
  const isAuthenticated = currentUserId !== null

  useEffect(() => {
    fetchIngredient()
    fetchCocktailsUsingIngredient()
    checkAuth()
    fetchChildren()
  }, [id])

  const canEdit = ingredient !== null && (isAdmin || (currentUserId !== null && ingredient.user_id === currentUserId))

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/check', {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.authenticated && data.user) {
        setCurrentUserId(data.user.id)
        setIsAdmin(data.user.is_admin || false)
      }
    } catch (err) {
      console.error('Auth check failed:', err)
    }
  }

  const fetchChildren = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/ingredients/${id}/variants`
      )
      if (!response.ok) return
      const data = await response.json()
      setChildren(data)
    } catch (err) {
      console.error('Error fetching variants:', err)
    }
  }

  const fetchIngredient = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/ingredients/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ingredient not found')
        }
        throw new Error('Failed to fetch ingredient')
      }
      const data = await response.json()
      setIngredient(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load ingredient')
      setLoading(false)
      console.error(err)
    }
  }

  const fetchCocktailsUsingIngredient = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/ingredients/${id}/cocktails`)
      if (!response.ok) throw new Error('Failed to fetch cocktails')
      const data = await response.json()
      setCocktails(data)
    } catch (err) {
      console.error('Error fetching cocktails:', err)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`http://localhost:5001/api/ingredients/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete ingredient')
      }
      setShowDeleteDialog(false)
      setAlertType('success')
      setAlertTitle('Ingredient Deleted')
      setAlertMessage('The ingredient has been successfully deleted')
      setShowAlertDialog(true)
    } catch (err: any) {
      setShowDeleteDialog(false)
      setAlertType('error')
      setAlertTitle('Delete Failed')
      setAlertMessage(err.message || 'Failed to delete ingredient')
      setShowAlertDialog(true)
    } finally {
      setDeleting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Spirit': return '🥃'
      case 'Liqueur': return '🍾'
      case 'Wine and Champagne': return '🍷'
      case 'Mixer': return '🥤'
      case 'Kitchen cupboard': return '🍯'
      case 'Beers and Cider': return '🍺'
      default: return '🍎'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Spirit': return 'from-amber-900/50 to-slate-800'
      case 'Liqueur': return 'from-purple-900/50 to-slate-800'
      case 'Wine': return 'from-red-900/50 to-slate-800'
      case 'Bitters': return 'from-orange-900/50 to-slate-800'
      case 'Juice': return 'from-green-900/50 to-slate-800'
      case 'Syrup': return 'from-yellow-900/50 to-slate-800'
      case 'Soda': return 'from-blue-900/50 to-slate-800'
      case 'Dairy': return 'from-slate-700/50 to-slate-800'
      case 'Egg': return 'from-amber-800/50 to-slate-800'
      case 'Fresh Ingredient': return 'from-emerald-900/50 to-slate-800'
      case 'Garnish': return 'from-lime-900/50 to-slate-800'
      default: return 'from-slate-900/50 to-slate-800'
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

  if (error || !ingredient) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to="/ingredients"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white inline-block"
          >
            ← Back to Ingredients
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
    <div className="mb-6 flex gap-3">
      {canEdit && (
        <>
          <Link
            to={`/ingredients/${id}/edit`}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-4 py-2 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-slate-600 hover:border-red-700/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Delete
          </button>
        </>
      )}
      {isAuthenticated && (
        <button
          onClick={() => setShowAddModal(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            addedToInventory
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 20H5a2 2 0 0 1-2-2V6l3-3h11a2 2 0 0 1 2 2v3"/>
            <path d="M13 20h6M16 17v6M8 17h.01"/>
          </svg>
          {addedToInventory ? 'Added to Inventory' : 'Add to Inventory'}
        </button>
      )}
    </div>
      <button
        onClick={() => navigate('/ingredients')}
        className="mb-6 text-slate-400 hover:text-white flex items-center space-x-2"
      >
        <span>←</span>
        <span>Back to Ingredients</span>
      </button>
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-8">
        <div className={`bg-gradient-to-br ${getCategoryColor(ingredient.category)} p-8`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-3">
                {ingredient.name}
              </h1>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 text-sm rounded border bg-slate-700/50 text-slate-300 border-slate-600">
                  {ingredient.category}
                </span>
                {ingredient.subcategory && (
                  <span className="px-3 py-1 text-sm rounded border bg-slate-700/50 text-slate-300 border-slate-600">
                    {ingredient.subcategory}
                  </span>
                )}
                {ingredient.abv > 0 && (
                  <span className="px-3 py-1 text-sm rounded border bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                    {ingredient.abv}% ABV
                  </span>
                )}
                {ingredient.is_base && (
                  <span className="px-3 py-1 text-sm rounded border bg-blue-500/20 text-blue-400 border-blue-500/50">
                    Base Ingredient
                  </span>
                )}
                {ingredient.parent_name && (
                  <Link
                    to={`/ingredients/${ingredient.parent_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1 text-sm rounded border bg-slate-700/50 text-slate-300 border-slate-600 hover:border-emerald-500 transition-colors"
                  >
                    ↑ {ingredient.parent_name}
                  </Link>
                )}
                <span className="px-3 py-1 text-sm rounded border bg-slate-700/50 text-slate-300 border-slate-600">
                  👤 by {ingredient.creator_name}
                </span>
              </div>
            </div>
            <div className="text-8xl ml-4">
              {getCategoryIcon(ingredient.category)}
            </div>
          </div>
        </div>
        <div className="p-8">
          {ingredient.description ? (
            <p className="text-slate-400 leading-relaxed italic text-base">
              {ingredient.description}
            </p>
          ) : (
            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700 text-center">
              <p className="text-slate-500">No description available</p>
            </div>
          )}
          {ingredient.parent_id && ingredient.parent_name && (
            <div className="mb-8 mt-10">
              <h2 className="text-2xl font-bold text-white flex items-center mb-4">
                Base Ingredient
              </h2>
              <Link
                to={`/ingredients/${ingredient.parent_id}`}
                className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors group"
              >
                <span className="text-3xl">{getCategoryIcon(ingredient.category)}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                      {ingredient.parent_name}
                    </span>
                    <span className="px-1.5 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Base
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {ingredient.category}
                  </div>
                </div>
                <span className="text-slate-500 group-hover:text-blue-400 transition-colors">→</span>
              </Link>
            </div>
          )}
          {ingredient.is_base && children.length > 0 && (
            <div className="mb-8 mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  Specific Variants
                </h2>
                <span className="text-slate-400">
                  {children.length} {children.length === 1 ? 'variant' : 'variants'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {children.map(child => (
                  <Link
                    key={child.id}
                    to={`/ingredients/${child.id}`}
                    className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors group"
                  >
                    <span className="text-2xl">{getCategoryIcon(child.category)}</span>
                    <div className="flex-1">
                      <div className="text-white font-medium group-hover:text-emerald-400 transition-colors">
                        {child.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {child.abv > 0 ? `${child.abv}% ABV` : 'Non-alcoholic'}
                        {child.user_id && (
                          <span className="ml-2 text-slate-600">• {child.creator_name}</span>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            Cocktails Using {ingredient.name}
          </h2>
          <span className="text-slate-400">
            {cocktails.length} {cocktails.length === 1 ? 'cocktail' : 'cocktails'}
          </span>
        </div>
        {cocktails.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-slate-400 mb-4">
              No cocktails found using {ingredient.name}
            </p>
            <p className="text-sm text-slate-500">
              This ingredient hasn't been added to any cocktails yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cocktails.map((cocktail) => (
              <Link
                key={cocktail.id}
                to={`/cocktails/${cocktail.id}`}
                className="bg-slate-800 rounded-lg border border-slate-700 hover:border-emerald-500 transition-colors overflow-hidden group"
              >
                <div className="relative">
                  <CocktailImage
                    imageUrl={cocktail.image_url ?? null}
                    name={cocktail.name}
                  />
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {cocktail.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(
                        cocktail.difficulty
                      )}`}
                    >
                      {cocktail.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {cocktail.description || 'No description available'}
                  </p>
                  <div className="space-y-2 text-sm">
                    {cocktail.glass_type && (
                      <div className="flex items-center text-slate-500">
                        <span className="mr-2">🥃</span>
                        <span>{cocktail.glass_type}</span>
                      </div>
                    )}
                    {cocktail.garnish && (
                      <div className="flex items-center text-slate-500">
                        <span className="mr-2">🍋</span>
                        <span className="line-clamp-1">{cocktail.garnish}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <span className="text-emerald-400 text-sm group-hover:text-emerald-300">
                      View Recipe →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Ingredient?"
        message={`Are you sure you want to delete "${ingredient.name}"? This action cannot be undone.`}
        itemName={ingredient.name}
        isLoading={deleting}
      />

      <AlertDialog
        isOpen={showAlertDialog}
        onClose={() => {
          setShowAlertDialog(false)
          if (alertType === 'success' && alertTitle === 'Ingredient Deleted') {
            navigate('/ingredients')
          }
        }}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
      />
      <AddToInventoryModal
        isOpen={showAddModal}
        ingredient={ingredient ? {
          id: ingredient.id,
          name: ingredient.name,
          category: ingredient.category,
          subcategory: ingredient.subcategory,
          abv: ingredient.abv,
          preferred_unit: ingredient.preferred_unit ?? null,
          preferred_mode: (ingredient.preferred_unit ? 'measured' : 'instructional') as 'measured' | 'instructional'
        } : null}
        onClose={() => setShowAddModal(false)}
        onAdded={() => {
          setAddedToInventory(true)
          setShowAddModal(false)
        }}
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import MakeCocktailConfirm from '../components/MakeCocktailConfirm'
import AlertDialog from '../components/AlertDialog'
import SubmitForReviewDialog from '../components/SubmitForReviewDialog'
import ConfirmDeleteDialog from '../components/ConfirmDeleteDialog'

interface Cocktail {
  id: number
  name: string
  description: string
  instructions: string
  difficulty: string
  glass_type: string
  garnish: string
  created_at: string
  ingredients: Ingredient[]
  servings: number
  user_id: number
  status: string
  submitted_at: string | null
  reviewed_at: string
  reviewed_by: string
  rejection_reason: string
  creator_name: string
  is_official: boolean
  favourited_by: number[]
}

interface Ingredient {
  id: number
  name: string
  category: string
  subcategory: string | null
  abv: number
  quantity: number | null
  unit: string | null
  quantity_note: string | null
  preferred_unit: string | null
  scaledQuantity?: number | null
}

interface MissingIngredient {
  id: number
  name: string
  required: string
  required_ml: number
  available_ml: number
  shortage_ml: number
}

export default function CocktailDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cocktail, setCocktail] = useState<Cocktail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentServings, setCurrentServings] = useState(1)
  const [canMake, setCanMake] = useState(false)
  const [missingIngredients, setMissingIngredients] = useState<MissingIngredient[]>([])
  const [makingCocktail, setMakingCocktail] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showAlertDialog, setShowAlertDialog] = useState(false)
  const [alertType, setAlertType] = useState<'success' | 'error'>('success')
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [isCreator, setIsCreator] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [favouriting, setFavouriting] = useState(false)
  const isFavourited = cocktail !== null && currentUserId !== null && cocktail.favourited_by.includes(currentUserId)

  useEffect(() => {
    fetchCocktail()
    checkCanMakeCocktail()
  }, [id])

  useEffect(() => {
    if (cocktail) {
      setCurrentServings(cocktail.servings || 1)
    }
  }, [cocktail])

  useEffect(() => {
    checkIfCreator()
  }, [id])

  useEffect(() => {
    if (cocktail && isAuthenticated) {
      checkCanMakeCocktail()
    }
  }, [currentServings])

  const checkIfCreator = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/check', {
        credentials: 'include'
      })
      const data = await response.json()
      if (data.authenticated && data.user && cocktail) {
        const userIdMatch = Number(data.user.id) === Number(cocktail.user_id)
        setCurrentUserId(data.user.id)
        setIsAdmin(data.user.is_admin || false)
        setIsCreator(userIdMatch)
      }
    } catch (err) {
      setIsCreator(false)
      setIsAdmin(false)
    }
  }

  const checkCanMakeCocktail = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/inventory/missing/${id}`, {
        credentials: 'include'
      })
      if (!response.ok) {
        setCanMake(false)
        setIsAuthenticated(false)
        return
      }
      const data = await response.json()
      setIsAuthenticated(true)
      setMissingIngredients(data)
      setCanMake(data.length === 0)
    } catch (err) {
      console.error('Error checking ingredients:', err)
      setCanMake(false)
      setIsAuthenticated(false)
    }
  }

  const handleMakeCocktail = () => {
    if (!canMake || !cocktail) return
    setShowConfirmDialog(true)
  }

  const confirmMakeCocktail = async () => {
    setMakingCocktail(true)
    try {
      const response = await fetch(`http://localhost:5001/api/inventory/make-cocktail/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ servings: currentServings })
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to make cocktail')
      }
      setShowConfirmDialog(false)
      setAlertType('success')
      setAlertTitle('Cocktail Made!')
      setAlertMessage(data.message)
      setShowAlertDialog(true)
      await checkCanMakeCocktail()
    } catch (err: any) {
      setShowConfirmDialog(false)
      setAlertType('error')
      setAlertTitle('Error')
      setAlertMessage(err.message || 'Failed to make cocktail')
      setShowAlertDialog(true)
    } finally {
      setMakingCocktail(false)
    }
  }

  const scaleIngredient = (ingredient: Ingredient, scale: number) => {
    if (ingredient.quantity_note) return null
    if (ingredient.quantity === null) return null
    return Math.round(ingredient.quantity * scale * 100) / 100
  }

  const formatQuantity = (ingredient: Ingredient & { scaledQuantity?: number | null }) => {
    if (ingredient.quantity_note) return ingredient.quantity_note
    if (ingredient.scaledQuantity !== null && ingredient.scaledQuantity !== undefined && ingredient.unit) {
      const val = ingredient.scaledQuantity
      const formatted = val % 1 === 0 ? val.toString() : val.toFixed(2).replace(/\.?0+$/, '')
      return `${formatted} ${ingredient.unit}`
    }
    return '—'
  }

  const getScaledIngredients = () => {
    if (!cocktail) return []
    const baseServings = cocktail.servings || 1
    const scale = currentServings / baseServings
    return cocktail.ingredients.map(ing => ({
      ...ing,
      scaledQuantity: scaleIngredient(ing, scale)
    }))
  }
  const scaledIngredients = getScaledIngredients()

  const fetchCocktail = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/cocktails/${id}`, {
        credentials: 'include'
      })
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Cocktail not found')
        }
        throw new Error('Failed to fetch cocktail')
      }
      const data = await response.json()
      setCocktail(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'Failed to load cocktail')
      setLoading(false)
      console.error(err)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'Advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }


  const handleSubmitForReview = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`http://localhost:5001/api/cocktails/submit/${id}`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit cocktail')
      }
      setShowSubmitDialog(false)
      setAlertType('success')
      setAlertTitle('Submitted for Review!')
      setAlertMessage("Your cocktail has been submitted. You'll be notified once it's been reviewed by an admin.")
      setShowAlertDialog(true)
      await fetchCocktail()
    } catch (err: any) {
      setShowSubmitDialog(false)
      setAlertType('error')
      setAlertTitle('Submission Failed')
      setAlertMessage(err.message || 'Failed to submit cocktail')
      setShowAlertDialog(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddToFavourites = async () => {
    if (!cocktail) return
    setFavouriting(true)
    try {
      const response = await fetch(`http://localhost:5001/api/cocktails/${id}/favourite`, {
        method: 'POST',
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add cocktail to favourites')
      }
      await fetchCocktail()
      setAlertType('success')
      setAlertTitle('Added to favourites')
      setAlertMessage(`${cocktail.name} has been added to favourites`)
      setShowAlertDialog(true)
    } catch (err: any) {
      setAlertType('error')
      setAlertTitle('Error')
      setAlertMessage(err.message || 'Failed to add to favourites')
      setShowAlertDialog(true)
      await fetchCocktail()
    } finally {
      setFavouriting(false)
    }
  }

  const handleRemoveFromFavourites = async () => {
    setFavouriting(true)
    try {
      const response = await fetch(`http://localhost:5001/api/cocktails/${id}/favourite`, {
        method: 'DELETE',
        credentials: 'include'
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove cocktail from favourites')
      }
      setAlertType('success')
      setAlertTitle('Removed from Favourites')
      setAlertMessage(`${cocktail?.name} has been removed from your favourites.`)
      setShowAlertDialog(true)
      await fetchCocktail()
    } catch (err: any) {
      setAlertType('error')
      setAlertTitle('Error')
      setAlertMessage(err.message || 'Failed to remove from favourites')
      setShowAlertDialog(true)
    } finally {
      setFavouriting(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`http://localhost:5001/api/cocktails/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete cocktail')
      }
      setShowDeleteDialog(false)
      setAlertType('success')
      setAlertTitle('Cocktail Deleted')
      setAlertMessage('The cocktail has been successfully deleted')
      setShowAlertDialog(true)
    } catch (err: any) {
      setShowDeleteDialog(false)
      setAlertType('error')
      setAlertTitle('Delete Failed')
      setAlertMessage(err.message || 'Failed to delete cocktail')
      setShowAlertDialog(true)
    } finally {
      setDeleting(false)
    }
  }

  const canEdit = isCreator || isAdmin

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Spirit':
        return '🥃'
      case 'Liqueur':
        return '🍾'
      case 'Wine':
        return '🍷'
      case 'Bitters':
        return '🧴'
      case 'Juice':
        return '🍊'
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">🍸</div>
          <p className="text-slate-400">Loading cocktail...</p>
        </div>
      </div>
    )
  }
  if (error || !cocktail) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <Link
            to="/cocktails"
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white inline-block"
          >
            ← Back to Cocktails
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
    {canEdit && cocktail && (
      <div className="mb-6 flex gap-3">
        <Link
          to={`/cocktails/${id}/edit`}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <span>Edit Cocktail</span>
        </Link>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <span>Delete Cocktail</span>
        </button>
      </div>
    )}
    <button
      onClick={() => navigate('/cocktails')}
      className="mb-6 text-slate-400 hover:text-white flex items-center space-x-2"
    >
      <span>←</span>
      <span>Back to Cocktails</span>
    </button>
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-900/50 to-slate-800 p-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl font-bold text-white">
                  {cocktail.name}
                </h1>
                {isAuthenticated && (
                  <button
                    onClick={isFavourited ? handleRemoveFromFavourites : handleAddToFavourites}
                    disabled={favouriting}
                    className="text-yellow-400 hover:text-yellow-300 disabled:opacity-50 transition-colors flex-shrink-0"
                    title={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
                  >
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill={isFavourited ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                )}
              </div>
              {cocktail.description && (
                <p className="text-xl text-slate-300 mb-4">
                  {cocktail.description}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 text-sm rounded border ${getDifficultyColor(
                    cocktail.difficulty
                  )}`}
                >
                  {cocktail.difficulty}
                </span>
                {cocktail.glass_type && (
                  <span className="px-3 py-1 text-sm rounded border bg-slate-700/50 text-slate-300 border-slate-600">
                    🥃 {cocktail.glass_type}
                  </span>
                )}
                {cocktail.status === 'pending' && (
                  <span className="px-3 py-1 text-sm rounded border bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                    ⏳ Pending Review
                  </span>
                )}
                {cocktail.status === 'approved' && !cocktail.is_official && (
                  <span className="px-3 py-1 text-sm rounded border bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                    ✓ Community Verified
                  </span>
                )}
                {cocktail.status === 'rejected' && (
                  <span className="px-3 py-1 text-sm rounded border bg-red-500/20 text-red-400 border-red-500/50">
                    ✗ Rejected
                  </span>
                )}
                {cocktail.is_official && (
                  <span className="px-3 py-1 text-sm rounded border bg-blue-500/20 text-blue-400 border-blue-500/50">
                    ⭐ Official Recipe
                  </span>
                )}
                {!cocktail.is_official && (
                  <span className="px-3 py-1 text-sm rounded border bg-slate-700/50 text-slate-300 border-slate-600">
                    👤 by {cocktail.creator_name}
                  </span>
                )}
              </div>
            </div>
            <div className="text-8xl ml-4">🍹</div>
          </div>
        </div>
        <div>
          <div className="flex justify-end gap-8 mb-4 mr-10">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <span className="ml-4">Servings</span>
            </h2>
            <div className="flex items-center gap-0">
              <button
                onClick={() => setCurrentServings(Math.max(1, currentServings - 1))}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white"
              >
                −
              </button>
              <span className="text-2xl font-bold text-emerald-400 min-w-[3rem] text-center">
                {currentServings}
              </span>
              <button
                onClick={() => setCurrentServings(Math.min(20, currentServings + 1))}
                className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-white"
              >
                +
              </button>
            </div>
          </div>
        </div>
        <div className="p-8 space-y-8">
          {cocktail.ingredients && cocktail.ingredients.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <span className="mr-2">🍎</span>
                What You'll Need
              </h2>
              <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
                <div className="space-y-3">
                  {scaledIngredients.map((ingredient) => {
                    const isApproximate = ingredient.unit
                      ? ['dash', 'dashes', 'splash', 'splashes', 'drop', 'drops'].includes(ingredient.unit.toLowerCase())
                      : false
                    return (
                      <div key={ingredient.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors">
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-2xl">{getCategoryIcon(ingredient.category)}</span>
                          <div className="flex-1">
                            <div className="text-white font-medium">{ingredient.name}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <span className="text-emerald-600">{ingredient.category}</span>
                              {ingredient.subcategory && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span>{ingredient.subcategory}</span>
                                </>
                              )}
                              {ingredient.abv > 0 && (
                                <>
                                  <span className="text-slate-600">•</span>
                                  <span>{ingredient.abv}% ABV</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {(ingredient.scaledQuantity !== null || ingredient.quantity_note) && (
                          <div className={`font-semibold text-sm ml-4 flex items-center gap-1 ${
                            ingredient.quantity_note ? 'text-blue-400' : 'text-emerald-400'
                          }`}>
                            {ingredient.quantity_note && <span className="text-xs">~</span>}
                            {formatQuantity(ingredient)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          {cocktail.garnish && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
                <span className="mr-2">🍋</span>
                Garnish
              </h2>
              <p className="text-slate-300 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                {cocktail.garnish}
              </p>
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-white mb-3 flex items-center">
              <span className="mr-2">📖</span>
              Instructions
            </h2>
            <div className="bg-slate-900/50 rounded-lg p-6 border border-slate-700">
              <div className="space-y-3">
                {cocktail.instructions.split('\n').map((step, index) => (
                  <div key={index} className="flex space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center text-sm font-semibold border border-emerald-500/50">
                      {index + 1}
                    </span>
                    <p className="text-slate-300 flex-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-700">
            <div className="text-sm text-slate-500">
              Added {new Date(cocktail.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-4 flex-wrap">
        {canMake && isAuthenticated && (
          <button
            onClick={handleMakeCocktail}
            disabled={makingCocktail}
            className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-2"
          >
            {makingCocktail ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Making...</span>
              </>
            ) : (
              <>
                <span>🍸</span>
                <span>Make This Cocktail ({currentServings} serving{currentServings > 1 ? 's' : ''})</span>
              </>
            )}
          </button>
        )}
        {!canMake && isAuthenticated && missingIngredients.length > 0 && (
          <div className="flex-1 px-6 py-3 bg-slate-700 border border-slate-600 rounded-lg">
            <div className="text-white font-semibold mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>Missing Ingredients:</span>
            </div>
            <div className="text-slate-400 text-sm">
              {missingIngredients.slice(0, 3).map(ing => ing.name).join(', ')}
              {missingIngredients.length > 3 && ` and ${missingIngredients.length - 3} more`}
            </div>
          </div>
        )}
        {isCreator && cocktail.status === 'private' && (
          <button
            onClick={() => setShowSubmitDialog(true)}
            className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-2"
          >
            <span>Submit for Review</span>
          </button>
        )}
        {isCreator && cocktail.status === 'pending' && (
          <div className="flex-1 px-6 py-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
            <div className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
              <span>⏳</span>
              <span>Pending Review</span>
            </div>
            <div className="text-slate-300 text-sm">
              Your cocktail is waiting for admin approval.
              {cocktail.submitted_at && (
                <span className="block text-slate-500 text-xs mt-1">
                  Submitted {new Date(cocktail.submitted_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
        {isCreator && cocktail.status === 'rejected' && (
          <div className="flex-1 px-6 py-3 bg-red-900/20 border border-red-700/50 rounded-lg">
            <div className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <span>✗</span>
              <span>Rejected</span>
            </div>
            {cocktail.rejection_reason ? (
              <>
                <div className="text-slate-300 text-sm mb-4">
                  <span className="font-semibold">Reason:</span> {cocktail.rejection_reason}
                </div>
                <button
                  onClick={() => setShowSubmitDialog(true)}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>Resubmit for Review</span>
                </button>
              </>
            ) : (
              <>
                <div className="text-slate-300 text-sm mb-4">
                  Your cocktail was rejected. Please edit and resubmit.
                </div>
                <button
                  onClick={() => setShowSubmitDialog(true)}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>📤</span>
                  <span>Resubmit for Review</span>
                </button>
              </>
            )}
          </div>
        )}
        {isCreator && cocktail.status === 'approved' && !cocktail.is_official && (
          <div className="flex-1 px-6 py-3 bg-emerald-900/20 border border-emerald-700/50 rounded-lg">
            <div className="text-emerald-400 font-semibold mb-2 flex items-center gap-2">
              <span>✓</span>
              <span>Approved!</span>
            </div>
            <div className="text-slate-300 text-sm">
              Your cocktail is now visible to the community.
            </div>
          </div>
        )}
        <Link
          to="/cocktails"
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold text-center transition-colors"
        >
          Browse More Cocktails
        </Link>
      </div>
      <MakeCocktailConfirm
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={confirmMakeCocktail}
        title={`Make ${currentServings} Serving${currentServings > 1 ? 's' : ''}?`}
        message={`You're about to make ${currentServings} serving${currentServings > 1 ? 's' : ''} of ${cocktail?.name}.`}
        ingredients={scaledIngredients.map(ing => ({
          name: ing.name,
          quantity: ing.scaledQuantity ?? null,
          unit: ing.unit,
          quantity_note: ing.quantity_note
        }))}
        confirmText="Make Cocktail"
        cancelText="Cancel"
        isLoading={makingCocktail}
      />

      <SubmitForReviewDialog
        isOpen={showSubmitDialog}
        onClose={() => setShowSubmitDialog(false)}
        onConfirm={handleSubmitForReview}
        cocktailName={cocktail?.name || ''}
        isLoading={submitting}
      />

      <AlertDialog
      isOpen={showAlertDialog}
      onClose={() => {
        setShowAlertDialog(false)
        if (alertType === 'success' && alertTitle === 'Cocktail Deleted') {
          navigate('/cocktails')
        }
      }}
      type={alertType}
      title={alertTitle}
      message={alertMessage}
      />

      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Cocktail?"
        message={`Are you sure you want to delete "${cocktail?.name}"? This action cannot be undone.`}
        itemName={cocktail?.name || ''}
        isLoading={deleting}
      />
    </div>
  )
}

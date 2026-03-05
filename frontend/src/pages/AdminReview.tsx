import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface PendingCocktail {
  id: number
  name: string
  description: string
  creator_name: string
  submitted_at: string
  difficulty: string
  ingredients: Array<{ name: string; quantity: string }>
}

export default function AdminReview() {
  const [pendingCocktails, setPendingCocktails] = useState<PendingCocktail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPending()
  }, [])

  const fetchPending = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/cocktails/pending', {
        credentials: 'include'
      })

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Admin access required')
        }
        throw new Error('Failed to fetch pending cocktails')
      }

      const data = await response.json()
      setPendingCocktails(data)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5001/api/cocktails/approve/${id}`, {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) throw new Error('Failed to approve')

      alert('✓ Cocktail approved!')
      fetchPending()
    } catch (err: any) {
      alert(err.message || 'Failed to approve')
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt('Reason for rejection:')
    if (!reason) return

    try {
      const response = await fetch(`http://localhost:5001/api/cocktails/reject/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reason })
      })

      if (!response.ok) throw new Error('Failed to reject')

      alert('Cocktail rejected')
      fetchPending()
    } catch (err: any) {
      alert(err.message || 'Failed to reject')
    }
  }

  if (loading) return <div className="text-center text-white">Loading...</div>
  if (error) return <div className="text-center text-red-400">{error}</div>

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">
        🛡️ Admin Review Queue
      </h1>
      {pendingCocktails.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
          <div className="text-4xl mb-4">✓</div>
          <p className="text-slate-400">No pending cocktails</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingCocktails.map(cocktail => (
            <div key={cocktail.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">{cocktail.name}</h3>
                  <p className="text-slate-400 text-sm">
                    by {cocktail.creator_name} • {new Date(cocktail.submitted_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-3 py-1 text-sm rounded border bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  {cocktail.difficulty}
                </span>
              </div>
              <p className="text-slate-300 mb-4">{cocktail.description}</p>
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Ingredients:</h4>
                <div className="flex flex-wrap gap-2">
                  {cocktail.ingredients.map((ing, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-900 text-slate-300 text-sm rounded">
                      {ing.name} ({ing.quantity})
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  to={`/cocktails/${cocktail.id}`}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
                >
                  View Full Recipe
                </Link>
                <button
                  onClick={() => handleApprove(cocktail.id)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleReject(cocktail.id)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                >
                  ✗ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

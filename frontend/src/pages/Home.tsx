import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

interface HomeProps {
  isAuthenticated: boolean
}
export default function Home({ isAuthenticated }: HomeProps) {
  const [stats, setStats] = useState({ cocktails: 0, ingredients: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:5000/api/cocktails/'),
      fetch('http://127.0.0.1:5000/api/ingredients/')
    ])
      .then(([cocktailsRes, ingredientsRes]) =>
        Promise.all([cocktailsRes.json(), ingredientsRes.json()])
      )
      .then(([cocktails, ingredients]) => {
        setStats({
          cocktails: cocktails.length,
          ingredients: ingredients.length
        })
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching stats:', err)
        setError('Failed to connect to backend')
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-12">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-white">
          Welcome to <span className="text-emerald-400">BruChef</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Your personal bartender companion. Discover cocktail recipes, manage ingredients,
          and craft the perfect drink every time.
        </p>
      </div>
      {loading && (
        <div className="text-center">
          <p className="text-gray-400">Connecting to backend...</p>
        </div>
      )}
      {error && (
        <div className="text-center">
          <div className="inline-block p-4 bg-red-900/50 border border-red-700 rounded">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
            <div className="text-4xl mb-2">🍹</div>
            <div className="text-3xl font-bold text-white">
              {stats.cocktails}
            </div>
            <div className="text-slate-400">Cocktail Recipes</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
            <div className="text-4xl mb-2">🍎</div>
            <div className="text-3xl font-bold text-white">
              {stats.ingredients}
            </div>
            <div className="text-slate-400">Ingredients</div>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/cocktails"
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors"
          >
            Browse Cocktails
          </Link>
          <Link
            to="/ingredients"
            className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            View Ingredients
          </Link>
        </div>
      )}
      {!isAuthenticated && !loading && !error && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-emerald-900/50 to-slate-800 rounded-lg border border-emerald-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Create an account for more features! ✨
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  Save your favorite cocktails, create custom recipes, and build your personal bar inventory.
                </p>
                <div className="flex gap-3">
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-medium transition-colors text-sm"
                  >
                    Sign Up Free
                  </Link>
                  <Link
                    to="/login"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-medium transition-colors text-sm"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!loading && !error && (
        <div className="text-center">
          <div className="inline-block p-3 bg-green-900/50 border border-green-700 rounded">
            <p className="text-green-400 text-sm">✓ Backend connected!</p>
          </div>
        </div>
      )}
    </div>
  )
}

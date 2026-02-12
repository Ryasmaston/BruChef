import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Home() {
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
      <div className="text-center">
        <img
          src="/Bru-chef.PNG"
          alt="BruChef Logo"
          className="mx-auto mb-6 w-75 h-auto"
        />
      </div>
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

import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BubbleBackground from '../components/BubbleBackground'
import CocktailImage from '../components/CocktailImage'

interface HomeProps {
  isAuthenticated: boolean
}

interface FeaturedCocktail {
  id: number
  name: string
  description: string
  difficulty: string
  glass_type: string
  image_url?: string | null
  ingredients: Array<{ name: string }>
}

export default function Home({ isAuthenticated }: HomeProps) {
  const [stats, setStats] = useState({ cocktails: 0, ingredients: 0 })
  const [featuredCocktail, setFeaturedCocktail] = useState<FeaturedCocktail | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5001/api/cocktails/'),
      fetch('http://localhost:5001/api/ingredients/')
    ])
      .then(([cocktailsRes, ingredientsRes]) =>
        Promise.all([cocktailsRes.json(), ingredientsRes.json()])
      )
      .then(([cocktails, ingredients]) => {
        setStats({
          cocktails: cocktails.length,
          ingredients: ingredients.length
        })
        const approved = cocktails.filter((c: any) => c.status === 'approved')
        if (approved.length > 0) {
          const random = approved[Math.floor(Math.random() * approved.length)]
          setFeaturedCocktail(random)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/50'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  return (
    <div className="w-full space-y-5">
      <div className="relative rounded-2xl overflow-hidden opacity-0 animate-fade-in-blur animation-delay-100">
        <div className="animate-morph-gradient absolute inset-0" />
        <BubbleBackground />
        <div className="relative z-10 pt-16 pb-16 px-8">
          <div className="text-center space-y-6">
            <h1 className="text-6xl font-calivorne text-white leading-tight animate-reveal-up">
              Craft the perfect<br />
              <span className="animate-shimmer">cocktail</span>
            </h1>
            <p className="text-lg text-slate-400 font-thin max-w-xl mx-auto leading-relaxed animate-typewriter">
              Discover recipes, manage your bar inventory, and find out exactly what you can make tonight.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <Link
                to="/cocktails"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Browse Cocktails
              </Link>
              {!isAuthenticated ? (
                <Link
                  to="/register"
                  className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg font-medium transition-colors"
                >
                  Create Account
                </Link>
              ) : (
                <Link
                  to="/inventory"
                  className="px-6 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500 rounded-lg font-medium transition-colors"
                >
                  My Inventory
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {!loading && featuredCocktail && (
        <div className="opacity-0 animate-fade-in-scale animation-delay-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Featured Recipe
            </span>
          </div>
          <div
            onClick={() => navigate(`/cocktails/${featuredCocktail.id}`)}
            className="cursor-pointer ..."
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="h-64 md:h-auto min-h-64 relative overflow-hidden">
                <CocktailImage
                  imageUrl={featuredCocktail.image_url ?? null}
                  name={featuredCocktail.name}
                  variant="detail"
                />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 text-xs rounded border ${getDifficultyColor(featuredCocktail.difficulty)}`}>
                    {featuredCocktail.difficulty}
                  </span>
                  {featuredCocktail.glass_type && (
                    <span className="px-2 py-1 text-xs rounded border bg-slate-700/50 text-slate-400 border-slate-600">
                      {featuredCocktail.glass_type}
                    </span>
                  )}
                </div>
                <h2 className="text-5xl font-calivorne text-white group-hover:text-emerald-400 transition-colors mb-3">
                  {featuredCocktail.name}
                </h2>
                {featuredCocktail.description && (
                  <p className="text-slate-400 mb-6 leading-relaxed line-clamp-3">
                    {featuredCocktail.description}
                  </p>
                )}
                {featuredCocktail.ingredients && featuredCocktail.ingredients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredCocktail.ingredients.slice(0, 5).map((ing, i) => (
                      <Link
                        key={i}
                        to={`/ingredients/${ing.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-1 text-xs rounded border bg-slate-900/50 text-slate-400 border-slate-700 hover:text-white hover:border-emerald-500 transition-colors"
                      >
                        {ing.name}
                      </Link>
                    ))}
                    {featuredCocktail.ingredients.length > 5 && (
                      <span className="px-2 py-1 text-xs rounded border bg-slate-900/50 text-slate-500 border-slate-700">
                        +{featuredCocktail.ingredients.length - 5} more
                      </span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <span>View Recipe</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div>
        <div className="flex items-center gap-3 mb-6 opacity-0 animate-fade-in-up animation-delay-400">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            What you can do
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              to: '/cocktails',
              title: 'Discover Recipes',
              desc: 'Browse our full library of cocktail recipes, from classics to community creations.',
              delay: 500
            },
            {
              to: isAuthenticated ? '/inventory' : '/register',
              title: 'Manage Your Bar',
              desc: "Track what's in your inventory and instantly see which cocktails you can make tonight.",
              delay: 600
            },
            {
              to: isAuthenticated ? '/cocktails/new' : '/register',
              title: 'Create Recipes',
              desc: 'Build and share your own cocktail recipes with the BruChef community.',
              delay: 700
            }
          ].map((card) => (
            <Link
              key={card.title}
              to={card.to}
              style={{ animationDelay: `${card.delay}ms` }}
              className="opacity-0 animate-fade-in-up group bg-slate-800 rounded-xl border border-slate-700 hover:border-emerald-500/50 p-6 transition-colors"
            >
              <div className="text-3xl">{card.icon}</div>
              <h3 className="font-calivorne text-2xl text-center font-semibold text-white group-hover:text-emerald-400 transition-colors animate-shimmer mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-slate-500 text-center leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
      {!isAuthenticated && !loading && (
        <div className="bg-gradient-to-br from-emerald-900/30 to-slate-800 rounded-xl border border-emerald-700/30 p-10 text-center opacity-0 animate-fade-in-up animation-delay-600">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Create a free account to save favourites, build your inventory, and craft your own recipes.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/register"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg font-medium transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

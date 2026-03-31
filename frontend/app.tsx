import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './src/components/Layout'
import Home from './src/pages/Home'
import Cocktails from './src/pages/Cocktails'
import CocktailCategory from './src/pages/CocktailCategory'
import CreateCocktail from './src/pages/CreateCocktail'
import CocktailDetail from './src/pages/CocktailDetail'
import Ingredients from './src/pages/Ingredients'
import About from './src/pages/About'
import Login from './src/pages/Login'
import Register from './src/pages/Register'
import Inventory from './src/pages/Inventory'
import IngredientDetail from './src/pages/IngredientDetail'
import AdminReview from './src/pages/AdminReview'
import EditCocktail from './src/pages/EditCocktail'
import EditIngredient from './src/pages/EditIngredient'
import Settings from './src/pages/Settings'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])
  const checkAuth = async () => {
    // console.log('Checking authentication')
    try {
      const response = await fetch('http://localhost:5001/api/auth/check', {
        credentials: 'include'
      })
      const data = await response.json()
      // console.log('Auth check response:', data)
      if (data.authenticated && data.user) {
        // console.log('User is authenticated')
        setIsAuthenticated(true)
        setUsername(data.user.username)
        setIsAdmin(data.user.is_admin || false)
      } else {
        // console.log('User is not authenticated')
        setIsAuthenticated(false)
        setUsername(null)
        setIsAdmin(false)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setUsername(null)
      setIsAdmin(false)
      // console.log('Not authenticated')
    } finally {
      setLoading(false)
    }
  }
  const handleLoginSuccess = () => {
    // console.log('handleLoginSuccess called')
    checkAuth()
  }
  const handleRegisterSuccess = () => {
    // console.log('handleRegisterSuccess called')
    checkAuth()
  }
  const handleLogout = () => {
    // console.log('handleLogout called')
    setIsAuthenticated(false)
    setUsername(null)
    setIsAdmin(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🍸</div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Layout
        isAuthenticated={isAuthenticated}
        username={username}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route path="/cocktails" element={<Cocktails isAuthenticated={isAuthenticated} />} />
          <Route path="/cocktails/:category" element={<CocktailCategory isAuthenticated={isAuthenticated} />} />
          <Route path="/cocktails/new" element={<CreateCocktail isAuthenticated={isAuthenticated} />} />
          <Route path="/cocktails/:id" element={<CocktailDetail />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/ingredients/:id" element={<IngredientDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} />} />
          <Route path="/inventory" element={<Inventory isAuthenticated={isAuthenticated} />} />
          <Route path='/admin/review' element={<AdminReview />} />
          <Route path="/cocktails/:id/edit" element={<EditCocktail isAuthenticated={isAuthenticated} />} />
          <Route path="/ingredients/:id/edit" element={<EditIngredient isAuthenticated={isAuthenticated} />} />
          <Route path="/settings" element={<Settings isAuthenticated={isAuthenticated} username={username} onUpdate={checkAuth} />}/>
        </Routes>
      </Layout>
    </Router>
  )
}

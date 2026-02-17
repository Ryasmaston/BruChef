import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Layout from './src/components/Layout'
import Home from './src/pages/Home'
import Cocktails from './src/pages/Cocktails'
import CocktailDetail from './src/pages/CocktailDetail'
import Ingredients from './src/pages/Ingredients'
import About from './src/pages/About'
import Login from './src/pages/Login'
import Register from './src/pages/Register'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])
  const checkAuth = async () => {
    console.log('Checking authentication')
    try {
      const response = await fetch('http://localhost:5001/api/auth/check', {
        credentials: 'include'
      })
      const data = await response.json()
      console.log('Auth check response:', data)
      if (data.authenticated && data.user) {
        console.log('User is authenticated')
        setIsAuthenticated(true)
        setUsername(data.user.username)
      } else {
        console.log('User is not authenticated')
        setIsAuthenticated(false)
        setUsername(null)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setUsername(null)
      console.log('Not authenticated')
    } finally {
      setLoading(false)
    }
  }
  const handleLoginSuccess = () => {
    console.log('handleLoginSuccess called')
    checkAuth()
  }
  const handleRegisterSuccess = () => {
    console.log('handleRegisterSuccess called')
    checkAuth()
  }
  const handleLogout = () => {
    console.log('handleLogout called')
    setIsAuthenticated(false)
    setUsername(null)
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
        onLogout={handleLogout}
      >
        <Routes>
          <Route path="/" element={<Home isAuthenticated={isAuthenticated} />} />
          <Route path="/cocktails" element={<Cocktails />} />
          <Route path="/cocktails/:id" element={<CocktailDetail />} />
          <Route path="/ingredients" element={<Ingredients />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register onRegisterSuccess={handleRegisterSuccess} />} />
        </Routes>
      </Layout>
    </Router>
  )
}

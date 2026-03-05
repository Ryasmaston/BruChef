import { Link, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  isAuthenticated: boolean
  username: string | null
  isAdmin: boolean
  onLogout: () => void
}

export default function Layout({ children, isAuthenticated, username, isAdmin, onLogout }: LayoutProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/cocktails', label: 'Cocktails' },
    { path: '/ingredients', label: 'Ingredients' },
    { path: '/inventory', label: 'Inventory'},
    { path: '/about', label: 'About' }
  ]

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5001/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      onLogout()
    } catch (error) {
      console.error('Logout error:', error)
      onLogout()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <nav className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center">
                <img
                  src="/Bru-chef.PNG"
                  alt="BruChef Logo"
                  className="w-50 h-auto mt-4"
                />
              </Link>
              <div className="flex space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.path)
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && isAdmin && (
                  <Link
                    to="/admin/review"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive('/admin/review')
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        : 'text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300'
                    }`}
                  >
                    <span>Admin Review</span>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 pl-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-slate-400">
                    Hello, <span className="text-emerald-400 font-semibold">{username}</span>
                    {isAdmin && (
                      <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded border border-yellow-500/50 font-semibold">
                        ADMIN
                      </span>
                    )}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-slate-400 text-sm">
            © 2026 BruChef
          </p>
        </div>
      </footer>
    </div>
  )
}

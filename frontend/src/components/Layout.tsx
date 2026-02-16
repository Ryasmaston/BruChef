import { Link, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}
export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/cocktails', label: 'Cocktails' },
    { path: '/ingredients', label: 'Ingredients' },
    { path: '/about', label: 'About' }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-center">
                <img
                  src="/Bru-chef.PNG"
                  alt="BruChef Logo"
                  className="mx-auto w-50 h-auto mt-5"
                />
              </div>
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

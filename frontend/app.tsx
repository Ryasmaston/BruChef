import { useEffect, useState } from 'react'

export default function App() {
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/test')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to connect to backend')
        setLoading(false)
        console.error(err)
      })
  }, [])

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="text-center">
        <img
          src="/Bru-chef.PNG"
          alt="BruChef Logo"
          className="mx-auto mb-6 w-200 h-auto"
        />

        {loading && <p className="text-gray-400">Connecting to backend...</p>}
        {error && <p className="text-red-400">{error}</p>}
        {message && (
          <div className="mt-4 p-4 bg-slate-800 rounded">
            <p className="text-green-400">✓ Backend connected!</p>
            <p className="text-sm text-gray-400">Message: {message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

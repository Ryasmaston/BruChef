import { useParams } from 'react-router-dom'

export default function CocktailDetail() {
  const { id } = useParams()
  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-6">Cocktail Detail</h1>
      <p className="text-slate-300">Viewing cocktail ID: {id}</p>
      <p className="text-slate-400 mt-2">Detail page coming soon...</p>
    </div>
  )
}

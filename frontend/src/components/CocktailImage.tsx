type Props = {
  imageUrl: string | null
  name: string
}

export default function CocktailImage({ imageUrl, name }: Props) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-48 object-cover"
      />
    )
  }
  return (
    <div className="h-48 bg-gradient-to-br from-emerald-900/50 to-slate-800 flex items-center justify-center">
      <span className="text-6xl">🍹</span>
    </div>
  )
}

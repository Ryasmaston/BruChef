type Props = {
  imageUrl: string | null
  name: string
  variant?: 'card' | 'detail' | 'thumb'
}

function buildImageUrl(url: string, width: number, height: number): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname === 'images.unsplash.com') {
      parsed.searchParams.delete('ixlib')
      parsed.searchParams.delete('ixid')
      parsed.searchParams.set('w', String(width))
      parsed.searchParams.set('h', String(height))
      parsed.searchParams.set('fit', 'crop')
      parsed.searchParams.set('crop', 'entropy')
      parsed.searchParams.set('auto', 'format')
      parsed.searchParams.set('q', '80')
      parsed.searchParams.set('sat', '-15')
      parsed.searchParams.set('con', '-5')
    }
    return parsed.toString()
  } catch {
    return url
  }
}

export default function CocktailImage({ imageUrl, name, variant = 'card' }: Props) {
  if (variant === 'thumb') {
    const src = imageUrl ? buildImageUrl(imageUrl, 320, 320) : null
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden shadow-2xl">
        {src ? (
          <>
            <img
              src={src}
              alt={name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tl from-slate-900/75 via-slate-900/25 to-transparent" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/60 to-slate-800 flex items-center justify-center rounded-xl">
            <span className="text-5xl opacity-50">🍹</span>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    const src = imageUrl ? buildImageUrl(imageUrl, 640, 360) : null
    return (
      <div className="relative w-full h-48 overflow-hidden">
        {src ? (
          <>
            <img
              src={src}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
            <div className="absolute inset-0 bg-emerald-950/20 mix-blend-multiply" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-slate-800 flex items-center justify-center">
            <span className="text-6xl opacity-50">🍹</span>
          </div>
        )}
      </div>
    )
  }

  const src = imageUrl ? buildImageUrl(imageUrl, 1200, 500) : null
  return (
    <div className="relative w-full h-64 md:h-80 overflow-hidden">
      {src ? (
        <>
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 to-transparent" />
        </>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-900/50 to-slate-800 flex items-center justify-center">
          <span className="text-8xl opacity-30">🍹</span>
        </div>
      )}
    </div>
  )
}

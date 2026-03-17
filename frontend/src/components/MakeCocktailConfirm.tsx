interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  ingredients?: Array<{
    name: string
    quantity: number | null
    unit: string | null
    quantity_note: string | null
  }>
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export default function MakeCocktailConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  ingredients,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const formatQuantity = (ing: { quantity: number | null; unit: string | null; quantity_note: string | null }) => {
    if (ing.quantity_note) return ing.quantity_note
    if (ing.quantity !== null && ing.unit) return `${ing.quantity} ${ing.unit}`
    return '—'
  }

  const measuredIngredients = ingredients?.filter(ing => !ing.quantity_note) || []

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🍸</span>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
        </div>
        <p className="text-slate-300 mb-4">{message}</p>
        {measuredIngredients.length > 0 && (
          <div className="bg-slate-900/50 rounded-lg p-4 mb-4 border border-slate-700">
            <div className="text-sm font-semibold text-emerald-400 mb-2">
              Will deduct from inventory:
            </div>
            <div className="space-y-2">
              {measuredIngredients.map((ing, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">{ing.name}</span>
                  <span className="text-emerald-400 font-semibold">{formatQuantity(ing)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Making...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  )
}

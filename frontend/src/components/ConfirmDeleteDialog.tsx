interface ConfirmDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
  quantity: string
  unit: string
  isLoading?: boolean
}

export default function ConfirmDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  quantity,
  unit,
  isLoading = false
}: ConfirmDeleteDialogProps) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-800 rounded-lg border border-red-700/50 p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🗑️</span>
          <h2 className="text-2xl font-bold text-white">Remove from Inventory?</h2>
        </div>
        <p className="text-slate-300 mb-4">
          Are you sure you want to remove this ingredient from your inventory?
        </p>
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-white font-semibold">{itemName}</div>
              <div className="text-sm text-slate-400 mt-1">
                {quantity} {unit}
              </div>
            </div>
            <div className="text-red-400 text-2xl">❌</div>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <p className="text-sm text-slate-400">
              The ingredient will be permanently removed from your inventory.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Removing...</span>
              </>
            ) : (
              <>
                <span>🗑️</span>
                <span>Remove</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

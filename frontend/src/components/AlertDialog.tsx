interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  type: 'success' | 'error'
  title: string
  message: string
}

export default function AlertDialog({
  isOpen,
  onClose,
  type,
  title,
  message
}: AlertDialogProps) {
  if (!isOpen) return null
  const bgColor = type === 'success' ? 'from-emerald-900/50 to-slate-800' : 'from-red-900/50 to-slate-800'
  const borderColor = type === 'success' ? 'border-emerald-500/50' : 'border-red-500/50'
  const icon = type === 'success' ? '🍸' : '⚠️'
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className={`bg-slate-800 rounded-lg border ${borderColor} p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200`}>
        <div className={`bg-gradient-to-br ${bgColor} -mx-6 -mt-6 p-6 rounded-t-lg mb-4`}>
          <div className="flex items-center gap-3">
            <span className="text-5xl">{icon}</span>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
          </div>
        </div>
        <p className="text-slate-300 mb-6">{message}</p>
        <button
          onClick={onClose}
          className={`w-full px-6 py-3 ${
            type === 'success'
              ? 'bg-emerald-500 hover:bg-emerald-600'
              : 'bg-red-500 hover:bg-red-600'
          } text-white rounded-lg font-semibold transition-colors`}
        >
          Got it!
        </button>
      </div>
    </div>
  )
}

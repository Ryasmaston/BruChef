interface SubmitForReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  cocktailName: string
  isLoading: boolean
}

export default function SubmitForReviewDialog({
  isOpen,
  onClose,
  onConfirm,
  cocktailName,
  isLoading
}: SubmitForReviewDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 max-w-md w-full">
        <div className="mb-6">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">📤</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Submit for Review?</h3>
          <p className="text-slate-400 text-sm">
            Submit <span className="text-white font-semibold">"{cocktailName}"</span> for admin review.
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span className="text-slate-300">Your recipe will be reviewed by an admin</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span className="text-slate-300">Once approved, it will be visible to all users</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">✓</span>
              <span className="text-slate-300">You'll be able to see the status on this page</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>Submit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

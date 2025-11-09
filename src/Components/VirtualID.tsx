// src/components/VirtualIDCard.tsx
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type VirtualIDProps = {
  open: boolean
  student: { studentId: string; name: string; parentPhone?: string } | null
  onClose?: () => void
  onMarkPresent?: () => void
  autoHideMs?: number // default 6000
}

export default function VirtualID({
  open,
  student,
  onClose,
  onMarkPresent,
  autoHideMs = 6000
}: VirtualIDProps) {
  useEffect(() => {
    if (!open) return
    if (!autoHideMs || autoHideMs <= 0) return
    const t = setTimeout(() => {
      onClose?.()
    }, autoHideMs)
    return () => clearTimeout(t)
  }, [open, autoHideMs, onClose])

  if (!student) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose?.()}
            className="fixed inset-0 bg-black z-40"
            aria-hidden="true"
            style={{ backdropFilter: 'blur(4px)' }}
          />

          {/* card */}
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(480px,92%)]"
            role="dialog"
            aria-modal="true"
            aria-label="Student ID Card"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden ring-1 ring-black/5">
              <div className="p-4 flex gap-4">
                {/* left: visual card */}
                <div className="w-40 min-w-40 bg-linear-to-br from-teal-600 to-blue-600 text-white rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex items-start gap-2">
                    {/* small inline logo */}
                    <div className="w-10 h-10 rounded-md bg-white/20 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M12 2L3 7v6c0 5 4 9 9 9s9-4 9-9V7l-9-5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                        <path d="M8 14s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs opacity-90">Truze School</div>
                      <div className="text-[10px] opacity-80">Student Card</div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-xs opacity-80">Valid</div>
                    <div className="text-sm font-semibold">2025 - 2026</div>
                  </div>

                  <div className="mt-3 text-right">
                    <div className="text-[10px] opacity-70">Status</div>
                    <div className="text-sm font-bold">Verified</div>
                  </div>
                </div>

                {/* right: details & actions */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Name</div>
                    <div className="text-lg font-semibold text-gray-900">{student.name}</div>

                    <div className="mt-3 text-xs text-gray-500">Student ID</div>
                    <div className="text-sm font-medium text-gray-700">{student.studentId}</div>

                    {student.parentPhone ? (
                      <>
                        <div className="mt-3 text-xs text-gray-500">Parent phone</div>
                        <div className="text-sm text-gray-700">{student.parentPhone}</div>
                      </>
                    ) : null}
                  </div>

                  <div className="mt-4 flex gap-3 items-center">
                    <button
                      onClick={() => onMarkPresent?.()}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
                    >
                      Mark Present
                    </button>

                    <button
                      onClick={() => onClose?.()}
                      className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      Dismiss
                    </button>

                    <div className="ml-auto text-sm text-gray-400 italic">Auto hide in {Math.round((autoHideMs || 6000)/1000)}s</div>
                  </div>
                </div>
              </div>

              {/* bottom ribbon */}
              <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
                <div>Captured by: Face Recognition</div>
                <div>Verified at: {new Date().toLocaleString()}</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

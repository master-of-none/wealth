import React, { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-gradient-to-br from-[#141c2e] to-[#0f1521] border border-[rgba(212,175,55,0.2)] rounded-2xl p-7 w-full max-w-[520px] max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div className="text-lg font-semibold text-[#d4af37] font-serif tracking-wide">
            {title}
          </div>
          <button
            className="p-1.5 bg-none border-none cursor-pointer text-[#8a9bb5] hover:text-[#d4af37] transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

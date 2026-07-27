import { ReactNode, RefObject, useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  ariaLabel?: string
  children: ReactNode
}

interface DialogA11yOptions {
  isOpen: boolean
  onClose: () => void
  containerRef: RefObject<HTMLElement | null>
  initialFocusRef?: RefObject<HTMLElement | null>
  closeOnEscape?: boolean
}

const openDialogs: symbol[] = []
let scrollLockCount = 0
let originalBodyOverflow = ''
let originalBodyPaddingRight = ''

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => {
    const styles = window.getComputedStyle(element)
    return !element.hasAttribute('hidden') && styles.display !== 'none' && styles.visibility !== 'hidden'
  })
}

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    const body = document.body
    originalBodyOverflow = body.style.overflow
    originalBodyPaddingRight = body.style.paddingRight

    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
    }
    body.style.overflow = 'hidden'
  }

  scrollLockCount += 1
  let released = false

  return () => {
    if (released) return
    released = true
    scrollLockCount = Math.max(0, scrollLockCount - 1)
    if (scrollLockCount === 0) {
      document.body.style.overflow = originalBodyOverflow
      document.body.style.paddingRight = originalBodyPaddingRight
    }
  }
}

export function useDialogAccessibility({
  isOpen,
  onClose,
  containerRef,
  initialFocusRef,
  closeOnEscape = true,
}: DialogA11yOptions) {
  const dialogIdRef = useRef(Symbol('dialog'))
  const onCloseRef = useRef(onClose)
  const closeOnEscapeRef = useRef(closeOnEscape)

  onCloseRef.current = onClose
  closeOnEscapeRef.current = closeOnEscape

  useEffect(() => {
    if (!isOpen) return

    const dialogId = dialogIdRef.current
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const unlockBodyScroll = lockBodyScroll()
    openDialogs.push(dialogId)

    const focusFrame = window.requestAnimationFrame(() => {
      if (openDialogs[openDialogs.length - 1] !== dialogId) return
      const container = containerRef.current
      const initialTarget = initialFocusRef?.current ?? (container ? getFocusableElements(container)[0] : null)
      ;(initialTarget ?? container)?.focus({ preventScroll: true })
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (openDialogs[openDialogs.length - 1] !== dialogId) return

      if (event.key === 'Escape' && closeOnEscapeRef.current) {
        event.preventDefault()
        event.stopPropagation()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab') return
      const container = containerRef.current
      if (!container) return

      const focusableElements = getFocusableElements(container)
      if (focusableElements.length === 0) {
        event.preventDefault()
        container.focus({ preventScroll: true })
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey && (activeElement === firstElement || !container.contains(activeElement))) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && (activeElement === lastElement || !container.contains(activeElement))) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.removeEventListener('keydown', handleKeyDown, true)

      const dialogIndex = openDialogs.lastIndexOf(dialogId)
      const wasTopDialog = dialogIndex === openDialogs.length - 1
      if (dialogIndex >= 0) openDialogs.splice(dialogIndex, 1)
      unlockBodyScroll()

      if (wasTopDialog && previouslyFocused?.isConnected) {
        window.requestAnimationFrame(() => previouslyFocused.focus({ preventScroll: true }))
      }
    }
  }, [containerRef, initialFocusRef, isOpen])
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  ariaLabel = '\u5bf9\u8bdd\u6846',
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useDialogAccessibility({
    isOpen,
    onClose,
    containerRef: dialogRef,
    initialFocusRef: closeButtonRef,
  })

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 0px))',
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 0px))',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in-up"
        style={{ animationDuration: '0.2s' }}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        aria-label={title ? undefined : ariaLabel}
        tabIndex={-1}
        className="glass-popup relative flex max-h-[min(88dvh,760px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl animate-scale-in"
        style={{ animationDuration: '0.22s' }}
      >
        <div className="flex flex-shrink-0 items-start gap-4 border-b border-dusk-300/25 px-5 py-4 sm:px-6">
          <div className="min-w-0 flex-1 pt-1">
            {title && (
              <h2 id={titleId} className="font-serif text-lg font-semibold text-dusk-50">
                {title}
              </h2>
            )}
            {description && (
              <p id={descriptionId} className={`${title ? 'mt-1' : ''} text-sm leading-5 text-dusk-100/70`}>
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={'\u5173\u95ed'}
            className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-lg text-dusk-100/75 transition-colors hover:bg-white/[0.07] hover:text-dusk-50 active:scale-95"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain p-5 scrollbar-hide sm:p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

import type { RefObject } from 'react'
import { useEffect, useRef } from 'react'

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
let originalBodyPosition = ''
let originalBodyTop = ''
let originalBodyWidth = ''
let lockedScrollY = 0

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => {
      const styles = window.getComputedStyle(element)
      return (
        !element.hasAttribute('hidden') &&
        styles.display !== 'none' &&
        styles.visibility !== 'hidden'
      )
    },
  )
}

function lockBodyScroll() {
  if (scrollLockCount === 0) {
    const body = document.body
    originalBodyOverflow = body.style.overflow
    originalBodyPaddingRight = body.style.paddingRight
    originalBodyPosition = body.style.position
    originalBodyTop = body.style.top
    originalBodyWidth = body.style.width
    lockedScrollY = window.scrollY

    const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth)
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`
    }
    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${lockedScrollY}px`
    body.style.width = '100%'
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
      document.body.style.position = originalBodyPosition
      document.body.style.top = originalBodyTop
      document.body.style.width = originalBodyWidth
      window.scrollTo(0, lockedScrollY)
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
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    const unlockBodyScroll = lockBodyScroll()
    openDialogs.push(dialogId)

    const focusFrame = window.requestAnimationFrame(() => {
      if (openDialogs[openDialogs.length - 1] !== dialogId) return
      const container = containerRef.current
      const initialTarget =
        initialFocusRef?.current ?? (container ? getFocusableElements(container)[0] : null)
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

      if (
        event.shiftKey &&
        (activeElement === firstElement || !container.contains(activeElement))
      ) {
        event.preventDefault()
        lastElement.focus()
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || !container.contains(activeElement))
      ) {
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

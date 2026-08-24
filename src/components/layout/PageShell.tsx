import { ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { Particles } from '../ui/Particles'

interface PageShellProps {
  children: ReactNode
  hideNav?: boolean
}

export function PersistentPageShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const hideNav = location.pathname === '/add'

  // Keep the existing reveal class contract, but observe the shell itself so
  // content that arrives after the first paint is animated as well.
  useEffect(() => {
    const root = document.documentElement
    const shell = document.querySelector<HTMLElement>('.app-shell')
    if (!shell) return

    const revealSelector = '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    const pendingFallbacks = new Map<Element, number>()
    let intersectionObserver: IntersectionObserver | null = null

    // CSS leaves reveal elements visible until this class is present. That
    // gives non-JS and unsupported-browser fallbacks a readable page.
    root.classList.add('reveal-enabled')

    const show = (element: Element) => {
      element.classList.add('visible')
      const fallback = pendingFallbacks.get(element)
      if (fallback !== undefined) {
        window.clearTimeout(fallback)
        pendingFallbacks.delete(element)
      }
      intersectionObserver?.unobserve(element)
    }

    const watch = (element: Element) => {
      if (element.classList.contains('visible')) return

      if (!intersectionObserver) {
        show(element)
        return
      }

      intersectionObserver.observe(element)
      // A pending node must never remain transparent if an embedded browser
      // reports an incomplete IntersectionObserver lifecycle.
      const fallback = window.setTimeout(() => show(element), 4000)
      pendingFallbacks.set(element, fallback)
    }

    if ('IntersectionObserver' in window) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) show(entry.target)
          })
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
      )
    }

    const scan = (node: ParentNode) => {
      if (node instanceof Element && node.matches(revealSelector)) watch(node)
      node.querySelectorAll(revealSelector).forEach(watch)
    }

    scan(shell)

    const mutationObserver =
      'MutationObserver' in window
        ? new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) scan(node as Element)
              })
              if (mutation.type === 'attributes' && mutation.target instanceof Element) {
                if (mutation.target.matches(revealSelector)) watch(mutation.target)
              }
            })
          })
        : null

    mutationObserver?.observe(shell, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      mutationObserver?.disconnect()
      intersectionObserver?.disconnect()
      pendingFallbacks.forEach((timer) => window.clearTimeout(timer))
      pendingFallbacks.clear()
      root.classList.remove('reveal-enabled')
    }
  }, [])

  return (
    <div className="app-shell min-h-dvh relative overflow-x-clip page-wrapper">
      <a href="#main-content" className="skip-link">
        跳到主要内容
      </a>
      <Particles />
      {!hideNav && <BottomNav />}
      <main
        id="main-content"
        className={`app-main relative z-10 ${hideNav ? 'app-main--focused' : ''}`}
      >
        {children}
      </main>
    </div>
  )
}

/** Route-level content wrapper; the navigation and particles live above it. */
export function PageShell({ children }: PageShellProps) {
  return <div className="page-route min-h-dvh page-wrapper">{children}</div>
}

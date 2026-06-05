import { useLayoutEffect, useRef } from 'react'

// The hacker-application background + content are authored on a fixed
// 1280 x 832 "stage". This hook scales that stage to best-fit the viewport
// (contain), so the whole design — including the text inside the white card —
// always stays in proportion and fits at any screen size.
const DESIGN_WIDTH = 1280
const DESIGN_HEIGHT = 832

export function useHackerPortalScale() {
  // attach this ref to the .hp-page element; the --hp-scale var inherits down
  // to the .hp-stage child that actually applies the transform
  const ref = useRef(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const scale = Math.min(
        window.innerWidth / DESIGN_WIDTH,
        window.innerHeight / DESIGN_HEIGHT,
      )
      el.style.setProperty('--hp-scale', String(scale))
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return ref
}

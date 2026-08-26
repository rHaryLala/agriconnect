import { useCallback, useRef, useState, type MouseEvent } from "react"
export function useTilt3D<T extends HTMLElement = HTMLDivElement>(maxDeg = 8) {
  const ref = useRef<T>(null)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [hovering, setHovering] = useState(false)

  const enabled =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const onMouseMove = useCallback(
    (e: MouseEvent<T>) => {
      if (!enabled || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width
      const py = (e.clientY - rect.top) / rect.height
      setRotate({
        y: (px - 0.5) * maxDeg * 2,
        x: -(py - 0.5) * maxDeg * 2,
      })
    },
    [enabled, maxDeg],
  )

  const onMouseEnter = useCallback(() => setHovering(true), [])
  const onMouseLeave = useCallback(() => {
    setHovering(false)
    setRotate({ x: 0, y: 0 })
  }, [])

  const style = enabled
    ? {
        transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(${
          hovering ? 1.02 : 1
        }, ${hovering ? 1.02 : 1}, 1)`,
        transition: hovering ? "transform 100ms ease-out" : "transform 500ms cubic-bezier(0.22,1,0.36,1)",
      }
    : undefined

  return { ref, style, onMouseMove, onMouseEnter, onMouseLeave }
}
import { useEffect, useRef, useState } from "react"
import { prefersReducedMotion, watchMotionPreference } from "@/lib/motion"
import { prefersReducedData } from "@/lib/network"

interface SectionVideoBackdropProps {
  videoSrc: string
  posterSrc: string
  overlayClassName?: string
}

export function SectionVideoBackdrop({ videoSrc, posterSrc, overlayClassName = "" }: SectionVideoBackdropProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [reduced, setReduced] = useState(prefersReducedMotion)
  const [sparingData] = useState(prefersReducedData)
  const [armed, setArmed] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => watchMotionPreference(() => setReduced(prefersReducedMotion())), [])

  const posterOnly = reduced || sparingData

  useEffect(() => {
    if (posterOnly) return
    const host = hostRef.current
    if (!host) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setArmed(true)
        const video = videoRef.current
        if (!video) return
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { rootMargin: "200px 0px" },
    )
    observer.observe(host)
    return () => observer.disconnect()
  }, [posterOnly])

  useEffect(() => {
    const video = videoRef.current
    if (!armed || !video) return
    video.load()
    void video.play().catch(() => {})
  }, [armed])

  useEffect(() => {
    if (posterOnly || !armed) return

    function onVisibility() {
      const video = videoRef.current
      if (!video) return
      if (document.hidden) video.pause()
      else void video.play().catch(() => {})
    }

    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [posterOnly, armed])

  return (
    <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0">
      <div className="sticky top-0 h-lvh w-full overflow-hidden">
        <img
          src={posterSrc}
          alt=""
          decoding="async"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {!posterOnly && (
          <video
            ref={videoRef}
            poster={posterSrc}
            muted
            loop
            playsInline
            preload="none"
            disableRemotePlayback
            tabIndex={-1}
            onCanPlay={() => setReady(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out motion-reduce:transition-none ${
              ready && !failed ? "opacity-100" : "opacity-0"
            }`}
          >
            {armed && <source src={videoSrc} type="video/mp4" onError={() => setFailed(true)} />}
          </video>
        )}

        <div className={`absolute inset-0 ${overlayClassName}`} />
      </div>
    </div>
  )
}

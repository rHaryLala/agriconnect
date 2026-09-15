import { useEffect, useRef, useState } from "react"
import { prefersReducedMotion, watchMotionPreference } from "@/lib/motion"

interface SectionVideoBackdropProps {
  videoSrc: string
  posterSrc: string
  /** Voile posé sur la vidéo pour que le contenu de la section reste lisible. */
  overlayClassName?: string
}

/**
 * Fond vidéo qui reste à l'écran pendant toute la traversée de la section.
 *
 * Trois précautions tiennent le coût :
 *   - `preload="none"` et une source posée seulement à l'approche de la section :
 *     la vidéo ne pèse rien tant que le visiteur ne descend pas jusqu'ici ;
 *   - la lecture est mise en pause hors champ et onglet masqué ;
 *   - l'affiche est une image à part entière sous la vidéo, pas un simple
 *     `poster` : elle sert d'attente, de repli si la vidéo échoue, et de fond
 *     définitif en mouvement réduit, où la vidéo n'est jamais chargée.
 *
 * `sticky` plutôt que `fixed` : la vidéo ne déborde jamais de la section, et
 * aucune mesure de scroll n'est nécessaire — le compositeur fait tout.
 * Elle impose en revanche qu'aucun ancêtre ne crée de conteneur de défilement
 * (`overflow: hidden`) ; la vitrine utilise `overflow-clip`, qui découpe sans
 * créer de scrollport.
 */
export function SectionVideoBackdrop({ videoSrc, posterSrc, overlayClassName = "" }: SectionVideoBackdropProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [reduced, setReduced] = useState(prefersReducedMotion)
  const [armed, setArmed] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => watchMotionPreference(() => setReduced(prefersReducedMotion())), [])

  // Une marge d'avance laisse le temps de mettre les premières frames en
  // tampon avant que la section n'arrive à l'écran.
  useEffect(() => {
    if (reduced) return
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
  }, [reduced])

  useEffect(() => {
    const video = videoRef.current
    if (!armed || !video) return
    video.load()
    void video.play().catch(() => {})
  }, [armed])

  // Un onglet masqué continue sinon à décoder pour rien.
  useEffect(() => {
    if (reduced || !armed) return

    function onVisibility() {
      const video = videoRef.current
      if (!video) return
      if (document.hidden) video.pause()
      else void video.play().catch(() => {})
    }

    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [reduced, armed])

  return (
    <div ref={hostRef} aria-hidden className="pointer-events-none absolute inset-0">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        <img
          src={posterSrc}
          alt=""
          decoding="async"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {!reduced && (
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

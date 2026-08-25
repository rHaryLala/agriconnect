import { useEffect, useState } from "react";

const IMAGES = [
  "/hero/hero-01.jpg",
  "/hero/hero-02.jpg",
  "/hero/hero-03.jpg",
  "/hero/hero-04.jpg",
  "/hero/hero-05.jpg",
  "/hero/hero-06.jpg",
  "/hero/hero-07.jpg",
];

const INTERVAL_MS = 5000;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          loading={i === 0 ? "eager" : "lazy"}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out motion-reduce:transition-none"
          style={{ 
            opacity: i === index ? 1 : 0,
            transform: i === index ? 'scale(1)' : 'scale(1.05)',
            transition: 'opacity 1200ms ease-in-out, transform 1200ms ease-in-out'
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B3B27]/70 via-[#0B3B27]/60 to-[#0B3B27]/75" />
    </div>
  );
}
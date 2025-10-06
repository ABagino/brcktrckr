"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "255, 205, 0";
const MOBILE_BREAKPOINT = 768;

// 🧩 Bento Card Data
const cardData = [
  {
    label: "Analyse",
    title: "Value Engine",
    description:
      "Identify part and set values, apply smart calculations, and see what sells best across the market.",
  },
  {
    label: "Discover",
    title: "Set Explorer",
    description:
      "Search sets and parts instantly, powered by BrickLink data and historical pricing.",
  },
  {
    label: "Compare",
    title: "Market Trends",
    description:
      "Check how prices have moved over time and benchmark your collection against the market.",
  },
  {
    label: "Community",
    title: "Data Feedback",
    description:
      "Help refine analytics by reporting missing sets or incorrect part valuations.",
  },
  {
    label: "About",
    title: "Powered by BrckTrckr",
    description:
      "Helping BrickLinkers identify value, spot market staples, and track long-term trends — for free.",
  },
];

const createParticleElement = (x: number, y: number, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius: number) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

// ✨ Particle Card
const ParticleCard = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = true,
  clickEffect = false,
  enableMagnetism = false,
}: any) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const timeoutsRef = useRef<any[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLDivElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<any>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(Math.random() * width, Math.random() * height, glowColor)
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => particle.remove(),
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true) as HTMLDivElement;
        cardRef.current!.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(clone, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3 });
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt)
        gsap.to(element, { rotateX: 5, rotateY: 5, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      gsap.to(element, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.3 });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;
        gsap.to(element, { rotateX, rotateY, duration: 0.1 });
      }

      if (enableMagnetism) {
        gsap.to(element, { x: (x - centerX) * 0.05, y: (y - centerY) * 0.05, duration: 0.3 });
      }
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations, enableTilt, enableMagnetism]);

  return (
    <div ref={cardRef} className={`${className} relative overflow-hidden`} style={style}>
      {children}
    </div>
  );
};

// 💡 Global Spotlight (safe version)
const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}: any) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.05) 40%,
        transparent 70%);
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!gridRef?.current) return;
      const cards = gridRef.current.querySelectorAll(".card");
      if (!cards.length) return;

      const { proximity, fadeDistance } = calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;

      cards.forEach((card: HTMLElement) => {
        if (!(card instanceof HTMLElement)) return;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        minDistance = Math.min(minDistance, distance);
        const glow =
          distance < proximity
            ? 1
            : distance < fadeDistance
            ? (fadeDistance - distance) / (fadeDistance - proximity)
            : 0;
        updateCardGlowProperties(card, e.clientX, e.clientY, glow, spotlightRadius);
      });

      gsap.to(spotlight, {
        left: e.clientX,
        top: e.clientY,
        opacity: minDistance < fadeDistance ? 0.8 : 0,
        duration: 0.2,
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      spotlight.remove();
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);

  return null;
};

// 📱 Mobile detection
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

// 🎨 Main Bento Component
const MagicBento = ({
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = true,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}: any) => {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  return (
    <>
      <style>{`
        .card-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-areas:
            "a a b c"
            "d e e e";
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 240px;
        }
        .card:nth-child(1) { grid-area: a; }
        .card:nth-child(2) { grid-area: b; }
        .card:nth-child(3) { grid-area: c; }
        .card:nth-child(4) { grid-area: d; }
        .card:nth-child(5) { grid-area: e; }

        @media (max-width: 1024px) {
          .card-grid {
            grid-template-areas:
              "a b"
              "c e"
              "d e";
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: 200px;
          }
        }

        @media (max-width: 600px) {
          .card-grid {
            grid-template-areas:
              "a"
              "b"
              "c"
              "d"
              "e";
            grid-template-columns: 1fr;
            grid-auto-rows: 180px;
          }
        }
      `}</style>

      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}

      <div className="w-full max-w-[90vw] mx-auto px-6 py-16">
        <div ref={gridRef} className="card-grid w-full">
          {cardData.map((card, index) => (
            <ParticleCard
              key={index}
              className={`card rounded-2xl border border-gray-700 bg-[#060010] p-6 text-white transition-all relative overflow-hidden ${
                enableBorderGlow ? "card--border-glow" : ""
              }`}
              style={{
                backgroundColor: "#060010",
                "--glow-x": "50%",
                "--glow-y": "50%",
                "--glow-intensity": "0",
                "--glow-radius": "200px",
              }}
              disableAnimations={shouldDisableAnimations}
              particleCount={particleCount}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
            >
              <div className="card__header mb-2">
                <span className="text-yellow-400 font-bold uppercase tracking-wide text-sm">
                  {card.label}
                </span>
              </div>
              <div className="card__content">
                <h3 className={`text-lg font-semibold mb-1 ${textAutoHide ? "truncate" : ""}`}>
                  {card.title}
                </h3>
                <p className={`text-sm opacity-80 ${textAutoHide ? "line-clamp-2" : ""}`}>
                  {card.description}
                </p>
              </div>
            </ParticleCard>
          ))}
        </div>
      </div>
    </>
  );
};

export default MagicBento;

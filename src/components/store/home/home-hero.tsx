"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const lines = ["Wear it first.", "Own it when", "you're sure."];

const SPARKS = (() => {
  const seeds = [
    [58, 42], [64, 55], [72, 38], [78, 48], [68, 62], [82, 58],
    [55, 50], [74, 70], [61, 34], [86, 44], [70, 28], [52, 66],
    [66, 46], [80, 36], [75, 52], [60, 58], [88, 52], [54, 38],
    [69, 74], [77, 64], [63, 48], [84, 30], [71, 42], [57, 72],
    [65, 32], [79, 68], [73, 24], [50, 54], [67, 56], [81, 46],
    [59, 28], [76, 40], [85, 62], [62, 68], [70, 50], [53, 44],
    [90, 40], [48, 60], [66, 22], [74, 58], [83, 74], [56, 36],
    [69, 36], [78, 28], [61, 76], [87, 56], [72, 66], [64, 40],
    [76, 45], [68, 38], [81, 52], [73, 60], [59, 48], [84, 42],
    [63, 55], [70, 33], [78, 70], [66, 64], [88, 48], [54, 58],
    [75, 28], [61, 42], [80, 64], [69, 50], [86, 36], [57, 68],
    [72, 54], [65, 72], [83, 32], [77, 48], [60, 30], [90, 58],
  ];

  return seeds.map(([left, top], i) => ({
    left: `${left}%`,
    top: `${top}%`,
    size: 1.1 + (i % 5) * 0.35,
    delay: `${((i * 0.22) % 7).toFixed(2)}s`,
    duration: `${(6.5 + (i % 8) * 0.75).toFixed(2)}s`,
    dx: `${i % 2 === 0 ? 12 : -12}px`,
  }));
})();

function HeroAtmosphere({ active }: { active: boolean }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <div
      className="hero-effects pointer-events-none absolute inset-0 z-3 overflow-hidden"
      data-active={active ? "true" : "false"}
      aria-hidden
    >
      <div className="hero-light-breath hero-light-a" />
      <div className="hero-light-breath hero-light-b" />

      {SPARKS.map((spark, i) => (
        <span
          key={i}
          className="hero-spark"
          style={
            {
              left: spark.left,
              top: spark.top,
              width: spark.size,
              height: spark.size,
              boxShadow: `0 0 ${spark.size * 2.5}px rgba(232, 213, 163, 0.55)`,
              ["--spark-delay" as string]: spark.delay,
              ["--spark-dur" as string]: spark.duration,
              ["--spark-dx" as string]: spark.dx,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [effectsActive, setEffectsActive] = useState(true);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const imageX = useTransform(scrollYProgress, [0, 1], ["0%", "2%"]);
  const contentY = useTransform(scrollYProgress, [0, 0.55], [0, -36]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      ([entry]) => setEffectsActive(entry.isIntersecting),
      { rootMargin: "10% 0px", threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      aria-labelledby="home-hero-heading"
      className="relative min-h-svh overflow-hidden bg-ink contain-paint"
    >
      <motion.div
        style={
          reduceMotion
            ? undefined
            : { scale: imageScale, x: imageX }
        }
        className="absolute inset-0 origin-right will-change-transform"
      >
        <motion.div
          initial={
            reduceMotion
              ? false
              : { scale: 1.06, x: "1.5%", opacity: 0 }
          }
          animate={{ scale: 1, x: "0%", opacity: 1 }}
          transition={{
            duration: 2.1,
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 1.1, ease: "easeOut" },
          }}
          className="absolute inset-0 origin-[68%_45%]"
        >
          <Image
            src="/home/hero.png"
            alt=""
            fill
            priority
            quality={90}
            // Height-based sizes: portrait cover crops a landscape source hard.
            sizes="(max-width: 768px) 150vh, 100vw"
            className="object-cover object-[56%_center] lg:object-[68%_center]"
          />
        </motion.div>
      </motion.div>

      <div
        className="absolute inset-0 z-2 bg-[radial-gradient(ellipse_at_70%_45%,transparent_20%,rgba(8,7,6,0.45)_70%,rgba(8,7,6,0.88)_100%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-2 bg-linear-to-r from-ink via-ink/65 to-transparent sm:via-ink/45"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 z-2 h-1/3 bg-linear-to-t from-background to-transparent"
        aria-hidden
      />

      <HeroAtmosphere active={effectsActive} />

      <p
        className="pointer-events-none absolute left-4 top-1/2 z-10 hidden origin-left -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-[0.45em] text-muted-foreground/70 lg:left-6 lg:block xl:left-8"
        aria-hidden
      >
        Decant · Bottle · Done
      </p>

      <div className="relative z-10 flex min-h-svh flex-col justify-between gap-10 px-4 pb-14 pt-28 sm:gap-12 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pb-24 lg:pt-36">
        <div className="mx-auto w-full max-w-7xl lg:pl-10 xl:pl-14">
          <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/70 sm:tracking-[0.35em] lg:hidden">
            Decant · Bottle · Done
          </p>
          <div
            className="hero-anim-line mb-6 h-px w-16 bg-amber sm:mb-8 sm:w-24"
            aria-hidden
          />

          <h1
            id="home-hero-heading"
            className="max-w-[12ch] font-display text-[clamp(3rem,11vw,6.5rem)] leading-[0.9] tracking-tight text-foreground"
          >
            <span className="sr-only">Luxury perfume decants in Sri Lanka — </span>
            {lines.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <span
                  className={`hero-anim-rise ${i > 0 ? "text-amber-soft" : ""}`}
                  style={{ animationDelay: `${0.28 + i * 0.12}s` }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>
        </div>

        <motion.div
          style={reduceMotion ? undefined : { y: contentY }}
          className="mx-auto w-full max-w-7xl lg:pl-10 xl:pl-14"
        >
          <p
            className="hero-anim-fade max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg"
            style={{ animationDelay: "0.85s" }}
          >
            Iconic maisons, sealed full bottles, and decants sized to try.
            Every bottle you buy is one you already love.
          </p>

          <div
            className="hero-anim-fade mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-8"
            style={{ animationDelay: "1s" }}
          >
            <Link
              href="/shop?type=decant"
              className="group relative inline-flex h-12 w-full items-center justify-center overflow-hidden bg-amber px-8 text-xs font-medium uppercase tracking-[0.22em] text-primary-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-soft sm:w-auto"
            >
              <span className="absolute inset-0 origin-left scale-x-0 bg-amber-soft transition duration-500 group-hover:scale-x-100" />
              <span className="relative">Start with a decant</span>
            </Link>
            <Link
              href="/shop"
              className="group inline-flex h-12 items-center justify-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground transition hover:text-amber focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber/50 sm:h-auto sm:justify-start"
            >
              Shop the collection
              <span aria-hidden className="transition group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

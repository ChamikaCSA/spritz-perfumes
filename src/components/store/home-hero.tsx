"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";

function buildSparks() {
  const seeds = [
    [58, 42], [64, 55], [72, 38], [78, 48], [68, 62], [82, 58],
    [55, 50], [74, 70], [61, 34], [86, 44], [70, 28], [52, 66],
    [66, 46], [80, 36], [75, 52], [60, 58], [88, 52], [54, 38],
    [69, 74], [77, 64], [63, 48], [84, 30], [71, 42], [57, 72],
    [65, 32], [79, 68], [73, 24], [50, 54], [67, 56], [81, 46],
    [59, 28], [76, 40], [85, 62], [62, 68], [70, 50], [53, 44],
    [90, 40], [48, 60], [66, 22], [74, 58], [83, 74], [56, 36],
    [69, 36], [78, 28], [61, 76], [87, 56], [72, 66], [64, 40],
  ];

  return seeds.map(([left, top], i) => ({
    left: `${left}%`,
    top: `${top}%`,
    size: 1.25 + (i % 4) * 0.4,
    delay: (i * 0.35) % 8,
    duration: 7.5 + (i % 7) * 0.9,
    drift: i % 2 === 0 ? 1 : -1,
  }));
}

const SPARKS = buildSparks();

function HeroSparks({ scrollY }: { scrollY: MotionValue<number> }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return null;

  return (
    <motion.div
      style={{ y: scrollY }}
      className="pointer-events-none absolute inset-0 z-1 overflow-hidden"
      aria-hidden
    >
      {SPARKS.map((spark, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-amber-soft"
          style={{
            left: spark.left,
            top: spark.top,
            width: spark.size,
            height: spark.size,
            boxShadow: `0 0 ${spark.size * 3}px rgba(232, 213, 163, 0.7)`,
          }}
          animate={{
            y: [0, -140, -260],
            x: [0, spark.drift * 14, spark.drift * -8],
            opacity: [0, 0.9, 0],
            scale: [0.4, 1, 0.3],
          }}
          transition={{
            duration: spark.duration,
            repeat: Infinity,
            ease: "easeOut",
            delay: spark.delay,
          }}
        />
      ))}
    </motion.div>
  );
}

export function HomeHero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const mistY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0.15]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh items-end overflow-hidden"
    >
      <motion.div
        style={{ scale: imageScale }}
        className="absolute inset-0 origin-center"
      >
        <Image
          src="/home/hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center]"
        />
      </motion.div>

      <HeroSparks scrollY={mistY} />

      <div
        className="absolute inset-0 z-2 bg-linear-to-t from-background via-background/75 to-background/25"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-2 bg-linear-to-r from-background/80 via-background/35 to-transparent"
        aria-hidden
      />

      <motion.div
        style={{ opacity: contentOpacity }}
        className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24"
      >
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mb-4 text-xs uppercase tracking-[0.35em] text-amber"
        >
          Sealed &amp; authentic
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl font-display text-[clamp(2.75rem,8vw,5.25rem)] leading-[0.95] tracking-tight text-foreground"
        >
          Fragrance from
          <span className="mt-1 block text-amber-soft/90">
            houses worth collecting.
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg"
        >
          Live with a scent before you commit — full bottles when you&apos;re
          sure, fine decants when you want to try first.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-4"
        >
          <Link
            href="/shop"
            className="inline-flex h-12 w-full items-center justify-center bg-amber px-8 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-amber-soft sm:w-auto"
          >
            Explore scents
          </Link>
          <Link
            href="/shop?type=decant"
            className="inline-flex h-12 w-full items-center justify-center border border-border px-8 text-xs uppercase tracking-[0.2em] text-foreground transition hover:border-amber hover:text-amber sm:w-auto"
          >
            Try a decant
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

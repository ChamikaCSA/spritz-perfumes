"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

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
          src="/home/hero-mist.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <div
        className="absolute inset-0 bg-linear-to-t from-background via-background/75 to-background/25"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-linear-to-r from-background/80 via-background/35 to-transparent"
        aria-hidden
      />

      <motion.div
        style={{ y: mistY }}
        className="pointer-events-none absolute inset-0"
        aria-hidden
      >
        <div className="absolute -left-1/4 bottom-1/4 h-[40vh] w-[50vw] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.12),transparent_70%)] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[45vh] w-[40vw] rounded-full bg-[radial-gradient(circle,rgba(120,80,30,0.18),transparent_65%)] blur-3xl" />
      </motion.div>

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
          Full size &amp; decants
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(3.75rem,14vw,8rem)] leading-[0.88] tracking-tight text-foreground"
        >
          Spritz
          <span className="mt-1 block text-amber-soft/90">Perfumes</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="mt-6 max-w-md text-base text-muted-foreground sm:text-lg"
        >
          Sealed authenticity — live with a scent before you commit.
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

"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useRef } from "react";
import { homeEase, homeViewport } from "@/components/store/home-motion";

const steps = [
  {
    n: "01",
    word: "Decant first",
    line: "2, 5, or 10 ml. Wear it for real days, not one sniff at the counter.",
  },
  {
    n: "02",
    word: "Live with it",
    line: "Office, evenings, weekends. If it stays on your mind, it's a keeper.",
  },
  {
    n: "03",
    word: "Go full size",
    line: "Upgrade to a sealed retail bottle only when you're sure. Zero buyer's remorse.",
  },
] as const;

function FormatPanel({
  href,
  image,
  eyebrow,
  title,
  description,
  cta,
  align = "left",
}: {
  href: string;
  image: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  align?: "left" | "right";
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const imageScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [1.1, 1.03, 1.06],
  );

  return (
    <Link
      ref={ref}
      href={href}
      aria-label={`${title}. ${cta}`}
      className={`group relative min-h-[42vh] overflow-hidden focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-amber/50 sm:min-h-[48vh] md:min-h-[58vh] ${
        align === "right"
          ? "border-t border-border/40 md:border-l md:border-t-0"
          : ""
      }`}
    >
      <motion.div
        style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-cover transition duration-700 ease-out group-hover:brightness-110 group-hover:contrast-[1.03]"
        />
      </motion.div>

      <div
        className="absolute inset-0 bg-linear-to-t from-background via-background/55 to-transparent transition duration-700 group-hover:via-background/40"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={homeViewport}
        transition={{ duration: 0.75, ease: homeEase }}
        className="absolute inset-x-0 bottom-0 p-6 transition duration-500 ease-out group-hover:-translate-y-1 sm:p-10 lg:p-12"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-amber">{eyebrow}</p>
        <h3 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl lg:text-5xl">
          {title}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
          {description}
        </p>
        <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground transition group-hover:text-amber sm:mt-6">
          {cta}
          <span
            aria-hidden
            className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
          >
            →
          </span>
        </span>
        <span
          className="mt-3 block h-px w-0 bg-amber/70 transition-all duration-500 group-hover:w-16"
          aria-hidden
        />
      </motion.div>

      <div
        className="pointer-events-none absolute inset-0 bg-amber/0 transition duration-700 group-hover:bg-amber/5"
        aria-hidden
      />
    </Link>
  );
}

export function HomeBuyPath() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineWidth = useTransform(scrollYProgress, [0.08, 0.35], ["0%", "100%"]);

  return (
    <section
      ref={ref}
      aria-labelledby="home-buy-path-heading"
      className="relative overflow-hidden border-y border-border/40"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_12%,rgba(212,175,55,0.1),transparent_55%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={homeViewport}
          transition={{ duration: 0.55 }}
          className="text-xs uppercase tracking-[0.3em] text-amber"
        >
          The smarter way to buy
        </motion.p>

        <div className="mt-6 grid gap-10 lg:mt-10 lg:grid-cols-[1fr_1.05fr] lg:items-end lg:gap-16">
          <div>
            <motion.h2
              id="home-buy-path-heading"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={homeViewport}
              transition={{ duration: 0.75, ease: homeEase }}
              className="font-display text-[clamp(2.25rem,6vw,4.25rem)] leading-[0.95] tracking-tight"
            >
              Try it on your skin.
              <span className="mt-1 block text-amber-soft/90">
                Buy it when it&apos;s yours.
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={homeViewport}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base"
            >
              Fragrance is personal. We make it easy to test-drive before you
              spend on a full bottle.
            </motion.p>
            <motion.div
              style={reduceMotion ? undefined : { width: lineWidth }}
              className="mt-8 h-px bg-amber/45"
              aria-hidden
            />
          </div>

          <ol className="divide-y divide-border/30">
            {steps.map((step, i) => (
              <motion.li
                key={step.word}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-20% 0px", amount: 0.6 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: homeEase,
                }}
                className="group/step grid grid-cols-[2.5rem_1fr] gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[3rem_1fr] sm:gap-5 sm:py-6"
              >
                <span className="pt-1 font-display text-sm text-amber/40 tabular-nums transition duration-300 group-hover/step:text-amber">
                  {step.n}
                </span>
                <div>
                  <p className="font-display text-2xl tracking-tight text-amber-soft transition duration-300 group-hover/step:translate-x-1 sm:text-3xl">
                    {step.word}
                  </p>
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground sm:mt-2">
                    {step.line}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={homeViewport}
          transition={{ duration: 0.65, ease: homeEase }}
          className="mt-14 flex flex-col items-start gap-3 pb-10 sm:mt-16 sm:flex-row sm:items-end sm:justify-between sm:pb-12 lg:mt-20"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber">
              Your move
            </p>
            <h3 className="mt-2 font-display text-2xl tracking-tight sm:text-3xl lg:text-4xl">
              Where are you starting?
            </h3>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-right">
            Still curious, or already sure? Pick a path.
          </p>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2">
        <FormatPanel
          href="/shop?type=decant"
          image="/home/format-decant.png"
          eyebrow="Start here"
          title="Decants"
          description="2 · 5 · 10 ml pours to test-drive a fragrance before you commit."
          cta="Browse decants"
        />
        <FormatPanel
          href="/shop?type=full_size"
          image="/home/format-full-size.png"
          eyebrow="Already sure"
          title="Full size"
          description="Factory-sealed retail bottles. Gift-ready, collection-worthy, 100% authentic."
          cta="Shop full bottles"
          align="right"
        />
      </div>
    </section>
  );
}

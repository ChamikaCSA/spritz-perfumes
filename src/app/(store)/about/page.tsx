import Link from "next/link";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:pt-32">
      <p className="text-xs uppercase tracking-[0.3em] text-amber">Our story</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl lg:text-6xl">About Spritz</h1>
      <div className="mt-8 space-y-5 text-muted-foreground">
        <p>
          Spritz Perfumes is a Sri Lanka based house for authentic full size and
          carefully poured decants. Every bottle we sell is sealed and genuine —
          whether you commit to a full size or try a measured pour first.
        </p>
        <p>
          Our counter is built for curiosity: explore by maison, concentration,
          season, or note, then live with a scent before you invest. Decants are
          filled from open inventory we track down to the millilitre.
        </p>
        <p>
          Whether you are building a wardrobe or gifting a first favourite, we
          keep the experience simple — honest stock, clear pricing, and
          island-wide delivery.
        </p>
      </div>
      <Link
        href="/shop"
        className="mt-10 inline-flex h-12 items-center bg-amber px-8 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-amber-soft"
      >
        Explore the shop
      </Link>
    </div>
  );
}

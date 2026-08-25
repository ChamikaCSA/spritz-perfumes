import Link from "next/link";
import { BRAND_CONTACT, BRAND_SOCIAL } from "@/lib/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Get in touch with Spritz Perfumes in Sri Lanka. WhatsApp, email, and social — daily 08:00–22:00 SLST.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:pt-32">
      <header className="max-w-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-amber">Reach us</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl lg:text-6xl">Contact</h1>
        <p className="mt-4 text-muted-foreground">
          Stock questions, order help, or a fragrance recommendation — message us
          and we&apos;ll get back to you.
        </p>
      </header>

      {/* Primary: chat */}
      <section className="mt-12 border-t border-border/50 pt-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Message us
        </p>
        <a
          href={BRAND_CONTACT.whatsappChatUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-12 items-center bg-amber px-8 text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground transition hover:bg-amber-soft"
        >
          {BRAND_CONTACT.whatsappDisplay}
        </a>
      </section>

      {/* Secondary: email + hours */}
      <section className="mt-14 grid gap-10 border-t border-border/50 pt-10 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Email
          </p>
          <a
            href={`mailto:${BRAND_CONTACT.email}`}
            className="mt-3 block text-lg transition hover:text-amber"
          >
            {BRAND_CONTACT.email}
          </a>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Hours
          </p>
          <p className="mt-3 text-lg">{BRAND_CONTACT.hours}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {BRAND_CONTACT.hoursNote}
          </p>
        </div>
      </section>

      {/* Follow */}
      <section className="mt-14 border-t border-border/50 pt-10">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Follow
        </p>
        <ul className="mt-6 divide-y divide-border/40">
          {BRAND_SOCIAL.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline justify-between gap-4 py-4 transition"
              >
                <span className="text-sm uppercase tracking-[0.16em] text-muted-foreground group-hover:text-amber">
                  {link.label}
                </span>
                <span className="text-sm text-foreground/80 group-hover:text-amber">
                  {link.handle}
                </span>
              </a>
            </li>
          ))}
          <li>
            <a
              href={BRAND_CONTACT.whatsappChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-baseline justify-between gap-4 py-4 transition"
            >
              <span className="text-sm uppercase tracking-[0.16em] text-muted-foreground group-hover:text-amber">
                WhatsApp
              </span>
              <span className="text-sm text-foreground/80 group-hover:text-amber">
              {BRAND_CONTACT.whatsappChannelName}
              </span>
            </a>
          </li>
        </ul>
      </section>

      <Link
        href="/shop"
        className="mt-14 inline-flex text-xs uppercase tracking-[0.2em] text-muted-foreground transition hover:text-amber"
      >
        ← Back to shop
      </Link>
    </div>
  );
}

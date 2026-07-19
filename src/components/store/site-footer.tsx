import Image from "next/image";
import Link from "next/link";
import { BRAND_CONTACT, BRAND_SOCIAL } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-4">
              <Image
                src="/brand/logo-amber.png"
                alt="Spritz Perfumes"
                width={200}
                height={200}
                className="h-12 w-auto shrink-0 object-contain sm:h-14"
              />
              <div className="min-w-0 max-w-sm">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Full size and fine decants — sealed authenticity, poured with
                  care.
                </p>
                <p className="mt-2 text-sm">
                  <a
                    href={BRAND_CONTACT.whatsappChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber transition hover:text-amber-soft"
                  >
                    {BRAND_CONTACT.whatsappDisplay}
                  </a>
                  <span className="text-muted-foreground/70"> · Sri Lanka</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 md:contents">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                Visit
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <Link
                    href="/shop"
                    className="text-muted-foreground transition hover:text-amber"
                  >
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    href="/brands"
                    className="text-muted-foreground transition hover:text-amber"
                  >
                    Brands
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground transition hover:text-amber"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground transition hover:text-amber"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
                Follow
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                {BRAND_SOCIAL.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition hover:text-amber"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href={BRAND_CONTACT.whatsappChannelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-amber"
                  >
                    Whatsapp
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-5 text-xs text-muted-foreground/70 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Spritz Perfumes</p>
        </div>
      </div>
    </footer>
  );
}

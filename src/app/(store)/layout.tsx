import { CartDrawer } from "@/components/store/layout/cart-drawer";
import { NavigationFeedback } from "@/components/store/layout/navigation-feedback";
import { SiteFooter } from "@/components/store/layout/site-footer";
import { SiteHeader } from "@/components/store/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <NavigationFeedback />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
    </>
  );
}

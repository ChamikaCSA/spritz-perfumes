import {
  AdminMobileHeader,
  AdminMobileNav,
  AdminSidebar,
} from "@/components/admin/admin-nav";
import { privateRouteMetadata } from "@/lib/seo";

export const metadata = privateRouteMetadata;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-ink text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminMobileHeader />
        <main className="flex-1 px-3 pb-[max(4.5rem,calc(3.5rem+env(safe-area-inset-bottom)))] pt-4 sm:px-6 sm:pt-7 lg:px-8 lg:pb-8 lg:pt-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
        <AdminMobileNav />
      </div>
    </div>
  );
}

import { privateRouteMetadata } from "@/lib/seo";

export const metadata = privateRouteMetadata;

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

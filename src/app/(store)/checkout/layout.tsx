import { privateRouteMetadata } from "@/lib/seo";

export const metadata = privateRouteMetadata;

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

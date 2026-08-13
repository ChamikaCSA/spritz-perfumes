import { privateRouteMetadata } from "@/lib/seo";

export const metadata = privateRouteMetadata;

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

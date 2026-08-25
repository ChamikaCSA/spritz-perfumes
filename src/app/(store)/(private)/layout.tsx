import { privateRouteMetadata } from "@/lib/seo";

export const metadata = privateRouteMetadata;

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

import { privateRouteMetadata } from "@/lib/seo";

export const metadata = privateRouteMetadata;

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

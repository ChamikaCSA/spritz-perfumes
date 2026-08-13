import { privateRouteMetadata } from "@/lib/seo";

export const metadata = privateRouteMetadata;

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

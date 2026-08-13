import { siteUrlWithUtm } from "@/lib/seo";

export const SOCIAL_BIO_LINKS = {
  instagram: siteUrlWithUtm("instagram"),
  facebook: siteUrlWithUtm("facebook"),
  tiktok: siteUrlWithUtm("tiktok"),
  whatsapp: siteUrlWithUtm("whatsapp"),
} as const;

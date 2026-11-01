import { PrivacyPolicy } from "@/components/sections/utility/PrivacyPolicy";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("privacy");

/** /privacy-policy (brief §13): PIPEDA-based policy from content/copy/privacy.ts. */
export default function PrivacyPolicyPage() {
  return (
    <>
      <PrivacyPolicy />
      <BreadcrumbJsonLd page="privacy" />
    </>
  );
}

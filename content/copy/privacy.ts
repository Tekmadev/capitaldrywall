/**
 * PRIVACY POLICY `/privacy-policy`: verbatim from CAPITAL_COPY.md (PIPEDA-based template), filled from
 * site.config. The deck's italic template note ("Not legal advice; the owner should review it before
 * launch") is an internal instruction: it lives in LAUNCH_CHECKLIST.md, not on the page.
 *
 * Inline markup in strings: **bold** and *italic* (render with a tiny parser; no HTML in content).
 */
import { site } from "../site.config";

/** Date the policy text last changed (shown as "Last updated"). */
export const privacyLastUpdated = "2026-10-30";

export type PolicyBlock =
  | { type: "p"; lead?: string; text: string }
  | { type: "ul"; items: string[] };

export type PolicySection = { title: string; blocks: PolicyBlock[] };

export const privacyPolicy: { title: string; intro: string; sections: PolicySection[] } = {
  title: "Privacy Policy",
  intro: `${site.name} ("we", "us", "our") respects your privacy. This policy explains what personal information we collect through ${site.domain} and when you contact us, how we use it, and the choices you have. We handle personal information in line with Canada's *Personal Information Protection and Electronic Documents Act* (PIPEDA).`,
  sections: [
    {
      title: "1. Who is responsible",
      blocks: [
        {
          type: "p",
          text: `${site.legalName}, Ottawa, Ontario. Questions about privacy go to our privacy contact at ${site.email} or ${site.phone.display}.`,
        },
      ],
    },
    {
      title: "2. Information we collect",
      blocks: [
        {
          type: "p",
          lead: "Information you give us:",
          text: "your name, phone number, email address, postal code or neighbourhood, project address if you share it, project details, photos you upload, your contact preferences, and anything you tell us by phone, text or email.",
        },
        {
          type: "p",
          lead: "Information collected automatically:",
          text: "we use privacy-friendly analytics that count page visits and actions without advertising cookies or cross-site tracking. Our hosting provider keeps standard server logs (such as IP address, browser type, pages requested, and date and time) for security and troubleshooting.",
        },
        {
          type: "p",
          text: "Photos you upload may show parts of your home. Please avoid including people, personal documents or anything you'd rather not share.",
        },
      ],
    },
    {
      title: "3. How we use it",
      blocks: [
        { type: "p", text: "We use your information to:" },
        {
          type: "ul",
          items: [
            "respond to your request and prepare a quote;",
            "schedule site visits and provide our services;",
            "send service messages such as confirmations, scheduling updates and invoices;",
            "improve our website and services;",
            "protect against spam, fraud and misuse;",
            "meet our legal, tax and accounting obligations;",
            "send occasional tips or offers, **only** if you opted in.",
          ],
        },
      ],
    },
    {
      title: "4. Consent",
      blocks: [
        {
          type: "p",
          text: "By submitting our form or contacting us, you consent to us using your information for the purposes above. You can withdraw consent at any time, subject to legal or contractual limits. If you withdraw consent, we may not be able to prepare a quote or provide services. We send marketing emails only with your express consent, and every one includes a way to unsubscribe, as required by Canada's Anti-Spam Legislation (CASL).",
        },
      ],
    },
    {
      title: "5. Sharing",
      blocks: [
        { type: "p", text: "We do not sell or rent your personal information. We share it only:" },
        {
          type: "ul",
          items: [
            "with service providers who help us run our business, such as website hosting, email delivery, file storage and scheduling or customer-management tools. They may use it only to provide services to us and must protect it;",
            "with licensed trades or suppliers working on your project, limited to what they need to do the work;",
            "when required or permitted by law.",
          ],
        },
      ],
    },
    {
      title: "6. Storage outside Canada",
      blocks: [
        {
          type: "p",
          text: "Some of our service providers store or process information in the United States or other countries. When your information is outside Canada, it is subject to the laws of that country and may be accessible to its courts, law enforcement and national security authorities.",
        },
      ],
    },
    {
      title: "7. How long we keep it",
      blocks: [
        {
          type: "ul",
          items: [
            "Quote requests that don't become projects: up to 24 months, then deleted.",
            "Customer and project records: as long as needed for the project and warranty, and at least as long as Canadian tax law requires.",
            "Uploaded photos: deleted when no longer needed for your quote, project or warranty.",
          ],
        },
      ],
    },
    {
      title: "8. Security",
      blocks: [
        {
          type: "p",
          text: "We use reasonable safeguards to protect your information, including encrypted connections (HTTPS), access limited to people who need it, and reputable service providers. No method of transmission or storage is completely secure, but we work to protect your information and will notify you if required by law.",
        },
      ],
    },
    {
      title: "9. Cookies",
      blocks: [
        {
          type: "p",
          text: "Our website does not use advertising or tracking cookies. If we ever add analytics that use cookies, we will ask for your consent first and update this policy.",
        },
      ],
    },
    {
      title: "10. Your rights",
      blocks: [
        {
          type: "p",
          text: `You can ask to access the personal information we hold about you, ask us to correct it, or withdraw your consent. Contact our privacy contact at ${site.email}. We'll respond within 30 days. If you're not satisfied with our response, you can contact the Office of the Privacy Commissioner of Canada at priv.gc.ca.`,
        },
      ],
    },
    {
      title: "11. Children",
      blocks: [
        {
          type: "p",
          text: "Our services are for homeowners and property managers. We do not knowingly collect personal information from children.",
        },
      ],
    },
    {
      title: "12. Other websites",
      blocks: [
        {
          type: "p",
          text: "Our site may link to other websites, such as Google or social media. Their privacy practices are their own.",
        },
      ],
    },
    {
      title: "13. Changes",
      blocks: [
        {
          type: "p",
          text: 'We may update this policy from time to time. The "Last updated" date shows when it last changed.',
        },
      ],
    },
    {
      title: "14. Contact",
      blocks: [
        {
          type: "p",
          text: `${site.legalName} · Ottawa, Ontario · ${site.email} · ${site.phone.display}`,
        },
      ],
    },
  ],
};

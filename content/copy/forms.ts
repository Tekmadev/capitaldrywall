/**
 * Quote form + quote emails copy (CAPITAL_COPY.md → FREE QUOTE "Form" / "Errors", and EMAILS).
 * Verbatim from the copy deck. Placeholders resolve from site.config.
 * The budget estimator's copy lives in content/copy/estimator.ts.
 */
import { pages } from "../services";
import { site } from "../site.config";

export type QuoteStepNumber = 1 | 2 | 3;

/** Step names (brief §12) label the progress rail; titles are the copy-deck step questions. */
export const quoteSteps: ReadonlyArray<{
  n: QuoteStepNumber;
  name: string;
  title: string;
  hint?: string;
}> = [
  { n: 1, name: "Service", title: "What do you need help with?", hint: "Pick all that apply." },
  { n: 2, name: "Project details", title: "Tell us about the project." },
  { n: 3, name: "Contact", title: "How should we reach you?" },
];

export const quoteFields = {
  area: { label: "Postal code or neighbourhood", placeholder: "K2M 0A1 or Kanata" },
  timeline: {
    label: "When would you like to start?",
    options: [
      { value: "asap", label: "ASAP" },
      { value: "month", label: "Within a month" },
      { value: "quarter", label: "1–3 months" },
      { value: "planning", label: "Just planning" },
    ],
  },
  size: {
    label: "Approximate size",
    optional: "optional",
    placeholder: "e.g. one ceiling, 800 sq ft basement",
  },
  details: {
    label: "Project details",
    placeholder: "What's going on? Holes, water damage, a basement you want finished…",
  },
  photos: {
    label: "Photos",
    optional: "optional",
    hint: "Add up to 6 photos. They help us price it faster.",
  },
  name: { label: "Full name" },
  phone: { label: "Phone" },
  email: { label: "Email" },
  contactMethod: {
    label: "Preferred contact",
    options: [
      { value: "call", label: "Call" },
      { value: "text", label: "Text" },
      { value: "email", label: "Email" },
    ],
  },
  /** Required consent; "Privacy Policy" renders as a link to /privacy-policy */
  consent: {
    before: `I agree that ${site.name} may contact me about this request. See our `,
    link: "Privacy Policy",
    href: pages.privacy,
    after: ".",
  },
  /** Optional CASL consent, unchecked by default */
  marketing: { label: "Send me occasional tips and offers. Unsubscribe anytime." },
} as const;

export const quoteButtons = { next: "Next", back: "Back", submit: "Send my request" } as const;

export const quoteErrors = {
  name: "Please enter your name.",
  phone: "Please enter a valid phone number.",
  email: "Please enter a valid email address.",
  area: "Please enter a postal code or neighbourhood.",
  services: "Please choose at least one service.",
  consent: "Please agree so we can contact you about your quote.",
  photos: "Photos must be images under 10 MB.",
  /** "Something went wrong. Please try again or call {{phone}}." ({{phone}} renders as a tel: link) */
  generic: { before: "Something went wrong. Please try again or call ", after: "." },
} as const;

export const genericErrorText = `${quoteErrors.generic.before}${site.phone.display}${quoteErrors.generic.after}`;

/* ── Emails (copy deck: EMAILS) ───────────────────────────────── */

export const quoteEmails = {
  customer: {
    subject: `We got your quote request · ${site.name}`,
    greeting: (firstName: string) => `Hi ${firstName},`,
    body: (services: string) =>
      `Thanks for reaching out. We've received your request for ${services} and will get back to you ${site.responsePromise} to talk it through and book a free site visit if needed.`,
    urgent: `If anything's urgent, call us at ${site.phone.display}.`,
    signoff: `— ${site.name}`,
    footer: `${site.phone.display} · ${site.domain}`,
  },
  business: {
    subject: (services: string, area: string) => `New quote request: ${services} · ${area}`,
  },
} as const;

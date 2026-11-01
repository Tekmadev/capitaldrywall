/** FREE QUOTE `/free-quote`, THANK YOU and 404: verbatim from CAPITAL_COPY.md. */
import { pages } from "../services";
import { site } from "../site.config";
import { ctas, nextSteps } from "./global";

export const quoteHeader = {
  h1: "Get a Free Quote",
  sub: "Tell us about your project. Photos help us give you a faster, more accurate price.",
};

export const quoteSidebar = {
  title: "Prefer to talk?",
  phone: site.phone.display,
  email: site.email,
  hours: site.hours,
  reply: `We reply ${site.responsePromise}.`,
  nextStepsTitle: "What happens next:",
  nextSteps,
  /** Shown only when BOOKING_URL is set (brief §12) */
  booking: { label: "Book a site visit" },
};

export const quoteAbout = {
  title: "About Capital Drywall & Renovation",
  body: "Capital Drywall & Renovation is an Ottawa contractor focused on drywall and basement finishing, with interior painting, bathroom and kitchen work alongside. We're a small, owner-run team, which means the person who quotes your job is accountable for how it turns out.",
  values: ["Clean job sites", "Written quotes", "Honest timelines", "Finished under raking light"],
};

export const thankYou = {
  h1: "Level. We've got it.",
  /** "Thanks{{, firstName}}." → pass the first name when known */
  body: (firstName?: string | null) =>
    `Thanks${firstName ? `, ${firstName}` : ""}. Your request is in, and we'll get back to you ${site.responsePromise}. Need us sooner? Call ${site.phone.display}.`,
  nextSteps,
  buttons: {
    home: { label: "Back to home", href: pages.home },
    call: { label: ctas.call, href: `tel:${site.phone.e164}` },
    booking: { label: "Book a site visit" },
  },
};

export const notFoundCopy = {
  h1: "This wall isn't finished yet.",
  body: "The page you're looking for doesn't exist or has moved.",
  buttons: {
    home: { label: "Back to home", href: pages.home },
    quote: { label: ctas.primary, href: pages.quote },
  },
};

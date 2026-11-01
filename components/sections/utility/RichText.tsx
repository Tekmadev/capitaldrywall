import { Fragment, type ReactNode } from "react";
import { CallLink, EmailLink } from "@/components/ui/CallLink";
import { site } from "@/content/site.config";

/** The Office of the Privacy Commissioner of Canada, named in the policy as "priv.gc.ca" */
const OPC = { text: "priv.gc.ca", href: "https://www.priv.gc.ca/" } as const;

const escapeRe = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** **bold** or *italic* (content strings use no other markup) */
const MARKS = /(\*\*[^*]+\*\*|\*[^*]+\*)/;
/** Business email, phone and priv.gc.ca become links wherever they appear */
const LINKS = new RegExp(`(${[site.email, site.phone.display, OPC.text].map(escapeRe).join("|")})`);
/** Run-in lists ("A · B · C"): each dot stays with the item before it, so no line starts with "·" */
const keepSeparators = (text: string) => text.replace(/ · /g, " · ");

const link = "link-inline text-[color:var(--ink)]";

/**
 * An email address that wraps after the "@" when it has to ("info@" / "example.com"), never
 * mid-name. Pair it with overflow-wrap:anywhere so a domain wider than its column still breaks.
 */
export function BreakableEmail({ email }: { email: string }) {
  const at = email.indexOf("@");
  if (at < 0) return email;
  return (
    <>
      {email.slice(0, at + 1)}
      <wbr />
      {email.slice(at + 1)}
    </>
  );
}

function linkify(text: string, location: string): ReactNode {
  const parts = text.split(LINKS);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part === site.email) {
      return (
        <EmailLink key={i} className={`${link} [overflow-wrap:anywhere]`}>
          <BreakableEmail email={part} />
        </EmailLink>
      );
    }
    if (part === site.phone.display) {
      return (
        <CallLink key={i} location={location} className={`${link} whitespace-nowrap`}>
          {part}
        </CallLink>
      );
    }
    if (part === OPC.text) {
      return (
        <a key={i} href={OPC.href} className={link} target="_blank" rel="noopener noreferrer">
          {part}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/**
 * Tiny inline renderer for content strings: `**bold**` → <strong>, `*italic*` → <em>, and the
 * business email / phone / priv.gc.ca → links (tel: links carry `location` for call_click).
 */
export function RichText({ text, location }: { text: string; location: string }) {
  return (
    <>
      {keepSeparators(text).split(MARKS).map((part, i) => {
        if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-[color:var(--ink)]">
              {linkify(part.slice(2, -2), location)}
            </strong>
          );
        }
        if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) {
          return <em key={i}>{linkify(part.slice(1, -1), location)}</em>;
        }
        return <Fragment key={i}>{linkify(part, location)}</Fragment>;
      })}
    </>
  );
}

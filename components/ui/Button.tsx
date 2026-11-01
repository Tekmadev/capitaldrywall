import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowIcon, PhoneIcon } from "./icons";

type Variant = "primary" | "secondary" | "ghost" | "call";
type Size = "sm" | "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Trailing dimension-arrow that nudges right on hover */
  arrow?: boolean;
  /** Leading icon (the call variant adds the phone icon itself) */
  icon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type LinkButtonProps = CommonProps & {
  href: string;
  /** Where on the page a tel: link sits, for the call_click event (e.g. "header", "hero") */
  trackLocation?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "children">;

type NativeButtonProps = CommonProps & {
  href?: undefined;
  loading?: boolean;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const base =
  "group/btn relative isolate inline-flex select-none items-center justify-center gap-3 overflow-hidden rounded-[2px] font-sans font-medium leading-none tracking-[0.01em] whitespace-nowrap " +
  "transition-[background-color,color,border-color,box-shadow] duration-200 ease-[var(--ease-rake)] " +
  "touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50";

/* Light-sweep shine: a soft white band that rakes across left → right on hover */
const shine =
  "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:-z-10 before:w-2/5 before:-translate-x-[130%] before:skew-x-[-18deg] " +
  "before:bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.5),transparent)] motion-safe:group-hover/btn:before:animate-sweep";

const variants: Record<Variant, string> = {
  primary: cn(
    "bg-worklight text-graphite hover:bg-worklight-deep active:bg-worklight-deep",
    shine,
  ),
  secondary: cn(
    "border border-[color:color-mix(in_srgb,var(--ink)_38%,transparent)] text-[color:var(--ink)] bg-transparent",
    "hover:border-[color:var(--ink)] hover:bg-[color:color-mix(in_srgb,var(--ink)_6%,transparent)]",
    shine,
    "before:bg-[linear-gradient(90deg,transparent,rgb(244_166_42/0.22),transparent)]",
  ),
  ghost: "text-[color:var(--ink)] px-0! min-h-11 link-draw",
  call: cn(
    "border border-[color:color-mix(in_srgb,var(--ink)_38%,transparent)] text-[color:var(--ink)] bg-transparent",
    "hover:border-[color:var(--ink)] hover:bg-[color:color-mix(in_srgb,var(--ink)_6%,transparent)] tabular-nums",
    shine,
    "before:bg-[linear-gradient(90deg,transparent,rgb(244_166_42/0.22),transparent)]",
  ),
};

const sizes: Record<Size, string> = {
  sm: "min-h-11 px-4 text-[0.9375rem]",
  md: "min-h-12 px-6 text-base",
  lg: "min-h-14 px-7 text-[1.0625rem]",
};

function Inner({
  variant,
  icon,
  arrow,
  loading,
  children,
}: Pick<CommonProps, "variant" | "icon" | "arrow" | "children"> & { loading?: boolean }) {
  return (
    <>
      {loading ? (
        <span
          aria-hidden="true"
          className="relative h-1.5 w-6 overflow-hidden rounded-full bg-current/25 after:absolute after:inset-y-0 after:left-0 after:w-2 after:rounded-full after:bg-current motion-safe:after:animate-[level-slide_900ms_ease-in-out_infinite_alternate]"
        />
      ) : variant === "call" ? (
        <PhoneIcon size={18} />
      ) : (
        icon
      )}
      <span>{children}</span>
      {arrow && (
        <ArrowIcon className="shrink-0 transition-transform duration-300 ease-[var(--ease-rake)] group-hover/btn:translate-x-1" />
      )}
    </>
  );
}

/**
 * Button: primary (amber fill, graphite text ≈ 9:1), secondary outline, ghost (amber underline draws),
 * call (outline + handset). Renders next/link for internal hrefs, <a> for tel:/mailto:/external,
 * <button> otherwise. Every target is at least 44 px tall.
 */
export function Button(props: ButtonProps) {
  const { variant = "primary", size = "md", arrow, icon, fullWidth, className, children } = props;
  const classes = cn(base, variants[variant], variant !== "ghost" && sizes[size], fullWidth && "w-full", className);

  if (props.href !== undefined) {
    const {
      href,
      trackLocation,
      variant: _v,
      size: _s,
      arrow: _a,
      icon: _i,
      fullWidth: _f,
      className: _c,
      children: _ch,
      ...rest
    } = props;
    const inner = (
      <Inner variant={variant} icon={icon} arrow={arrow}>
        {children}
      </Inner>
    );
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} className={classes} {...rest}>
          {inner}
        </Link>
      );
    }
    const isExternal = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        data-location={href.startsWith("tel:") ? trackLocation : undefined}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {inner}
      </a>
    );
  }

  const {
    loading,
    variant: _v,
    size: _s,
    arrow: _a,
    icon: _i,
    fullWidth: _f,
    className: _c,
    children: _ch,
    type = "button",
    disabled,
    ...rest
  } = props;
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Inner variant={variant} icon={icon} arrow={arrow} loading={loading}>
        {children}
      </Inner>
    </button>
  );
}

/**
 * Drawing-sheet form primitives shared by QuoteForm and CompactQuoteForm.
 * Fields are cells of a hairline title block: mono field label, borderless control, shared 1 px
 * rules. Selection shows registration ticks + an amber tick; focus shows an amber edge with a
 * graphite band (≥ 3:1 on plaster, like the global ring). Errors carry a revision mark, text and
 * a left rule, so colour is never the only signal.
 */
import type { InputHTMLAttributes, ReactNode, Ref, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { TickIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> };
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { ref?: Ref<HTMLTextAreaElement> };
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { ref?: Ref<HTMLSelectElement> };

/** Focus indicator drawn by a cell when its (borderless or visually hidden) control has focus */
export const cellFocus =
  "has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-worklight has-[:focus-visible]:shadow-[inset_0_0_0_4px_var(--color-graphite)]";

/** Error rule on a cell's left edge (paired with the revision mark + message) */
const errorRule =
  "before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-[1] before:w-[3px] before:bg-[color:var(--error)]";

export const controlBase =
  "block w-full bg-transparent px-4 text-[1.0625rem] leading-snug text-[color:var(--ink)] caret-worklight " +
  "placeholder:text-[color:var(--muted)] placeholder:opacity-80 focus-visible:outline-none focus-visible:shadow-none " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "autofill:shadow-[inset_0_0_0_100px_var(--surface)] autofill:[-webkit-text-fill-color:var(--ink)]";

/** Joined cells sharing 1 px hairlines (gap-px over a hairline background) */
export function CellGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("grid gap-px border border-[color:var(--hairline)] bg-[color:var(--hairline)]", className)}>
      {children}
    </div>
  );
}

/** Empty schedule cell, hatched like a void on a drawing (fills incomplete grid rows) */
export function HatchCell({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "bg-[color:var(--surface)] bg-[repeating-linear-gradient(135deg,transparent_0_7px,color-mix(in_srgb,var(--ink)_7%,transparent)_7px_8px)]",
        className,
      )}
    />
  );
}

/** Drafting revision delta with "!", the error marker */
export function RevisionMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={15}
      height={15}
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <path d="M8 1.6 15 14.4H1Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="miter" />
      <path d="M8 6.2v4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 11.6v1.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function FieldError({ id, message, className }: { id: string; message?: string; className?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className={cn(
        "flex items-start gap-2 px-4 pb-3.5 text-[0.9375rem] leading-snug font-medium text-[color:var(--error)]",
        className,
      )}
    >
      <RevisionMark className="mt-[3px]" />
      <span>{message}</span>
    </p>
  );
}

/** Mono field label row: label left, optional tag right */
function LabelRow({
  htmlFor,
  label,
  optional,
  as = "label",
  id,
}: {
  htmlFor?: string;
  label: ReactNode;
  optional?: string;
  as?: "label" | "span";
  id?: string;
}) {
  const Tag = as;
  return (
    <div className="flex items-baseline justify-between gap-3 px-4 pt-3.5 pb-1">
      <Tag id={id} {...(as === "label" ? { htmlFor } : {})} className="t-spec">
        {label}
      </Tag>
      {optional && (
        <span className="t-spec text-[0.625rem]! opacity-90" aria-hidden="true">
          {optional}
        </span>
      )}
    </div>
  );
}

const cellBase = "relative flex min-w-0 flex-col bg-[color:var(--surface)]";

export function TextCell({
  id,
  label,
  optional,
  error,
  className,
  inputProps,
}: {
  id: string;
  label: ReactNode;
  optional?: string;
  error?: string;
  className?: string;
  inputProps: InputProps;
}) {
  const errorId = `${id}-error`;
  const { className: inputClassName, ...rest } = inputProps;
  return (
    <div className={cn(cellBase, cellFocus, error && errorRule, className)}>
      <LabelRow htmlFor={id} label={label} optional={optional} />
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(controlBase, "min-h-12 pb-3.5 pt-1", inputClassName)}
        {...rest}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function TextareaCell({
  id,
  label,
  optional,
  error,
  className,
  textareaProps,
  compact,
}: {
  id: string;
  label: ReactNode;
  optional?: string;
  error?: string;
  className?: string;
  textareaProps: TextareaProps;
  /** Shorter box (the compact form's short message) */
  compact?: boolean;
}) {
  const errorId = `${id}-error`;
  const { className: textareaClassName, ...rest } = textareaProps;
  return (
    <div className={cn(cellBase, cellFocus, error && errorRule, className)}>
      <LabelRow htmlFor={id} label={label} optional={optional} />
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          controlBase,
          "resize-y pb-3.5 pt-1 leading-relaxed",
          compact ? "min-h-24" : "min-h-32",
          textareaClassName,
        )}
        {...rest}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}

export function SelectCell({
  id,
  label,
  error,
  className,
  selectProps,
  children,
}: {
  id: string;
  label: ReactNode;
  error?: string;
  className?: string;
  selectProps: SelectProps;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={cn(cellBase, cellFocus, error && errorRule, className)}>
      <LabelRow htmlFor={id} label={label} />
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(controlBase, "min-h-12 cursor-pointer appearance-none pb-3.5 pt-1 pr-11")}
          {...selectProps}
        >
          {children}
        </select>
        {/* Drafting caret: a small open arrowhead */}
        <svg
          viewBox="0 0 12 8"
          width={12}
          height={8}
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-[calc(50%-6px)] text-[color:var(--spec)]"
        >
          <path d="m1 1.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** Corner registration ticks: preview on hover, drawn in when the tile is selected */
function TileTicks() {
  const tick =
    "absolute size-2.5 border-[color:var(--ink)] opacity-0 transition-[opacity,translate] duration-200 ease-[var(--ease-rake)] " +
    "group-hover/tile:opacity-35 group-has-[:checked]/tile:translate-x-0 group-has-[:checked]/tile:translate-y-0 group-has-[:checked]/tile:opacity-100";
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-1.5">
      <span className={cn(tick, "left-0 top-0 -translate-x-1 -translate-y-1 border-l border-t")} />
      <span className={cn(tick, "right-0 top-0 translate-x-1 -translate-y-1 border-r border-t")} />
      <span className={cn(tick, "bottom-0 left-0 -translate-x-1 translate-y-1 border-b border-l")} />
      <span className={cn(tick, "bottom-0 right-0 translate-x-1 translate-y-1 border-b border-r")} />
    </span>
  );
}

/** Square check box / round radio indicator. Selected: ink fill with the amber tick or dot. */
function Indicator({ type }: { type: "checkbox" | "radio" }) {
  if (type === "radio") {
    return (
      <span
        aria-hidden="true"
        className="grid size-[1.125rem] shrink-0 place-items-center rounded-full border border-[color:color-mix(in_srgb,var(--ink)_50%,transparent)] transition-colors duration-200 group-hover/tile:border-[color:var(--ink)] group-has-[:checked]/tile:border-[color:var(--ink)] group-has-[:checked]/tile:bg-[color:var(--ink)]"
      >
        <span className="size-2 scale-0 rounded-full bg-worklight transition-transform duration-200 ease-[var(--ease-rake)] group-has-[:checked]/tile:scale-100" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className="grid size-5 shrink-0 place-items-center rounded-[2px] border border-[color:color-mix(in_srgb,var(--ink)_50%,transparent)] transition-colors duration-200 group-hover/tile:border-[color:var(--ink)] group-has-[:checked]/tile:border-[color:var(--ink)] group-has-[:checked]/tile:bg-[color:var(--ink)]"
    >
      <TickIcon
        size={14}
        className="text-worklight opacity-0 transition-opacity duration-150 group-has-[:checked]/tile:opacity-100"
      />
    </span>
  );
}

const tileBase =
  "group/tile relative flex cursor-pointer select-none bg-[color:var(--surface)] transition-colors duration-200 " +
  "hover:bg-[color:var(--surface-raised)] has-[:checked]:bg-[color:var(--surface-raised)] " +
  "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50";

/** Selectable schedule cell (checkbox or radio). The native input stays in the DOM for a11y. */
export function ChoiceTile({
  type,
  label,
  index,
  size = "md",
  className,
  inputProps,
}: {
  type: "checkbox" | "radio";
  label: ReactNode;
  /** Mono schedule number, e.g. "01" (decorative) */
  index?: string;
  size?: "md" | "sm";
  className?: string;
  inputProps: InputProps;
}) {
  return (
    <label
      className={cn(
        tileBase,
        cellFocus,
        size === "md"
          ? "min-h-[6.25rem] flex-col justify-between gap-4 p-4"
          : "min-h-14 items-center gap-3 px-4 py-3",
        className,
      )}
    >
      <input type={type} className="peer sr-only" {...inputProps} />
      {size === "md" ? (
        <>
          <span className="flex items-start justify-between gap-3">
            {index ? (
              <span aria-hidden="true" className="t-spec tabular-nums">
                {index}
              </span>
            ) : (
              <span />
            )}
            <Indicator type={type} />
          </span>
          <span className="text-[1.0625rem] font-medium leading-snug text-[color:var(--ink)] text-balance">{label}</span>
        </>
      ) : (
        <>
          <Indicator type={type} />
          <span className="text-[1rem] font-medium leading-snug text-[color:var(--ink)]">{label}</span>
        </>
      )}
      <TileTicks />
    </label>
  );
}

/** A labelled group of choice tiles (radio group or checkbox group) as one cell */
export function ChoiceGroupCell({
  id,
  label,
  error,
  className,
  children,
  role = "radiogroup",
  describedBy,
}: {
  id: string;
  label: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
  role?: "radiogroup" | "group";
  describedBy?: string;
}) {
  const labelId = `${id}-label`;
  const errorId = `${id}-error`;
  return (
    <div
      role={role}
      aria-labelledby={labelId}
      aria-describedby={cn(describedBy, error && errorId) || undefined}
      className={cn(cellBase, error && errorRule, className)}
    >
      <LabelRow as="span" id={labelId} label={label} />
      <div className="px-4 pb-4 pt-2">{children}</div>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** Consent row: check box + rich label, as one cell */
export function CheckCell({
  id,
  error,
  className,
  inputProps,
  children,
}: {
  id: string;
  error?: string;
  className?: string;
  inputProps: InputProps;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={cn(cellBase, cellFocus, error && errorRule, className)}>
      <label htmlFor={id} className="group/tile flex cursor-pointer items-start gap-4 px-4 py-4">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        <span className="mt-0.5">
          <Indicator type="checkbox" />
        </span>
        <span className="text-[0.9375rem] leading-relaxed text-[color:var(--ink)]">{children}</span>
      </label>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

/** Visually hidden honeypot (bots fill it; people never see or reach it) */
export function Honeypot({ inputRef }: { inputRef?: Ref<HTMLInputElement> }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto size-px overflow-hidden">
      <label>
        Website
        <input ref={inputRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

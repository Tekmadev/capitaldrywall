"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { CallLink } from "@/components/ui/CallLink";
import { quoteButtons, quoteErrors, quoteFields, quoteSteps } from "@/content/copy/forms";
import { getService, services, type ServiceId } from "@/content/services";
import { site } from "@/content/site.config";
import { track } from "@/lib/analytics";
import { rememberFirstName, submitLead } from "@/lib/quote/client";
import { compactQuoteSchema, type CompactQuoteInput, type CompactQuoteOutput } from "@/lib/quote/schema";
import { cn } from "@/lib/utils";
import { CellGrid, CheckCell, Honeypot, RevisionMark, SelectCell, TextCell, TextareaCell } from "./fields";

type FieldName = FieldPath<CompactQuoteInput>;
type Status = "idle" | "sending" | "error";

export type CompactQuoteFormProps = {
  /** Preselected service (the page's own service) */
  service?: ServiceId;
  /** "Page source" sent with the lead (defaults to the current path) */
  source?: string;
  /** Kitchen sink: no analytics */
  forceStatic?: boolean;
  /** Kitchen sink states */
  demo?: "errors" | "submit-error" | "sending";
  className?: string;
};

const subscribeNoop = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

/**
 * One-step quote form for the service pages' final CTA (dark surface). A real
 * `<form method="post" action="/api/quote">`: without JS it posts and the API answers with a 303 to
 * /thank-you; with JS it validates with the shared zod schema and submits with fetch.
 */
export function CompactQuoteForm({ service, source, forceStatic = false, demo, className }: CompactQuoteFormProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fid = (name: string) => `cq${uid}-${name}`;
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();
  const [status, setStatus] = useState<Status>(
    demo === "submit-error" ? "error" : demo === "sending" ? "sending" : "idle",
  );

  // After the first send attempt, fields validate on blur
  const [attempted, setAttempted] = useState(demo === "errors");
  const started = useRef(false);
  const startedAt = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);

  const preselected = service && getService(service) ? service : undefined;

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getFieldState,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<CompactQuoteInput, unknown, CompactQuoteOutput>({
    resolver: zodResolver(compactQuoteSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      form: "compact",
      services: preselected ? [preselected] : [],
      details: "",
      name: "",
      phone: "",
      email: "",
      consent: false,
    },
  });

  useEffect(() => {
    startedAt.current = Date.now();
    if (demo === "errors") void trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  const field = (name: FieldName) =>
    register(name, {
      onBlur: () => {
        if (attempted) void trigger(name);
      },
      onChange: () => {
        if (attempted && getFieldState(name).error) void trigger(name);
      },
    });

  const markStarted = () => {
    if (started.current || forceStatic) return;
    started.current = true;
    track("quote_start", { form: "compact" });
  };

  const onValid = async (values: CompactQuoteOutput) => {
    setStatus("sending");
    const result = await submitLead({
      ...values,
      form: "compact",
      source: source ?? pathname,
      website: honeypot.current?.value ?? "",
      startedAt: startedAt.current || Date.now(),
      submittedAt: Date.now(),
    });
    if (result.ok) {
      rememberFirstName(values.name);
      if (!forceStatic) track("quote_submit", { services: values.services.length, photos: false, form: "compact" });
      router.push(result.redirect);
      return;
    }
    if (result.kind === "validation") {
      let first: FieldName | null = null;
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        const message = messages?.[0];
        if (!message || !(name in compactQuoteSchema.shape)) continue;
        setError(name as FieldName, { type: "server", message });
        first ??= name as FieldName;
      }
      if (first) {
        setStatus("idle");
        setFocus(first);
        return;
      }
    }
    setStatus("error");
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (status === "sending") {
      e.preventDefault();
      return;
    }
    setAttempted(true);
    void handleSubmit(onValid)(e);
  };

  const sending = status === "sending";
  const errorOf = (name: keyof CompactQuoteInput) => errors[name]?.message as string | undefined;

  return (
    <form
      method="post"
      action="/api/quote"
      noValidate={hydrated}
      onSubmit={onSubmit}
      onFocusCapture={markStarted}
      onPointerDownCapture={markStarted}
      aria-busy={sending || undefined}
      className={cn("@container relative", className)}
    >
      <input type="hidden" name="form" value="compact" />
      <input type="hidden" name="source" value={source ?? pathname} />
      <Honeypot inputRef={honeypot} />

      <CellGrid className="grid-cols-1 @xl:grid-cols-2">
        <TextCell
          id={fid("name")}
          label={quoteFields.name.label}
          error={errorOf("name")}
          inputProps={{
            ...field("name"),
            autoComplete: "name",
            autoCapitalize: "words",
            enterKeyHint: "next",
            required: true,
            maxLength: 120,
          }}
        />
        <TextCell
          id={fid("phone")}
          label={quoteFields.phone.label}
          error={errorOf("phone")}
          inputProps={{
            ...field("phone"),
            type: "tel",
            inputMode: "tel",
            autoComplete: "tel",
            enterKeyHint: "next",
            required: true,
            maxLength: 40,
          }}
        />
        <TextCell
          id={fid("email")}
          label={quoteFields.email.label}
          error={errorOf("email")}
          inputProps={{
            ...field("email"),
            type: "email",
            inputMode: "email",
            autoComplete: "email",
            autoCapitalize: "none",
            spellCheck: false,
            enterKeyHint: "next",
            required: true,
            maxLength: 254,
          }}
        />
        <Controller
          control={control}
          name="services"
          render={({ field: f }) => (
            <SelectCell
              id={fid("service")}
              label={quoteSteps[0].title}
              error={errorOf("services")}
              selectProps={{
                name: "services",
                ref: f.ref,
                value: f.value?.[0] ?? "",
                onChange: (e) => {
                  f.onChange(e.target.value ? [e.target.value] : []);
                  if (attempted) void trigger("services");
                },
                onBlur: () => {
                  f.onBlur();
                  if (attempted) void trigger("services");
                },
                required: true,
              }}
            >
              <option value="" disabled>
                —
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.formLabel}
                </option>
              ))}
            </SelectCell>
          )}
        />
        <TextareaCell
          id={fid("details")}
          label={quoteFields.details.label}
          className="@xl:col-span-2"
          textareaProps={{
            ...field("details"),
            placeholder: quoteFields.details.placeholder,
            rows: 3,
            maxLength: 2000,
          }}
          compact
        />
        <CheckCell
          id={fid("consent")}
          error={errorOf("consent")}
          className="@xl:col-span-2"
          inputProps={{ ...field("consent"), required: true }}
        >
          {quoteFields.consent.before}
          <a href={quoteFields.consent.href} className="link-inline font-medium">
            {quoteFields.consent.link}
          </a>
          {quoteFields.consent.after}
        </CheckCell>
      </CellGrid>

      {status === "error" && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-3 border border-[color:var(--error)] px-4 py-3.5 text-[color:var(--error)]"
        >
          <RevisionMark className="mt-1" />
          <p className="text-[0.9375rem] font-medium leading-snug">
            {quoteErrors.generic.before}
            <CallLink location="compact-quote-error" className="link-inline text-[color:var(--ink)]">
              {site.phone.display}
            </CallLink>
            {quoteErrors.generic.after}
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Button type="submit" size="lg" loading={sending} arrow={!sending} className="w-full @md:w-auto">
          {quoteButtons.submit}
        </Button>
      </div>
    </form>
  );
}

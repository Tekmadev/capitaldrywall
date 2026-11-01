"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { useForm, type FieldErrors, type FieldPath } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { CallLink } from "@/components/ui/CallLink";
import { RegistrationMarks } from "@/components/ui/drafting";
import { ArrowIcon, TickIcon } from "@/components/ui/icons";
import { LevelVial } from "@/components/ui/LevelVial";
import {
  quoteButtons,
  quoteErrors,
  quoteFields,
  quoteSteps,
  type QuoteStepNumber,
} from "@/content/copy/forms";
import { services } from "@/content/services";
import { site } from "@/content/site.config";
import { track } from "@/lib/analytics";
import { clearDraft, loadDraft, rememberFirstName, saveDraft, submitLead } from "@/lib/quote/client";
import {
  quoteSchema,
  stepFields,
  stepOfField,
  type QuoteInput,
  type QuoteOutput,
} from "@/lib/quote/schema";
import { cn, pad2 } from "@/lib/utils";
import {
  CellGrid,
  CheckCell,
  ChoiceGroupCell,
  ChoiceTile,
  FieldError,
  HatchCell,
  Honeypot,
  RevisionMark,
  TextCell,
  TextareaCell,
} from "./fields";
import { PhotoDrop, type PhotoDropHandle, type PhotoItem } from "./PhotoDrop";
import { QueryPrefill, type QuotePrefill } from "./QueryPrefill";

type Step = QuoteStepNumber;
type FieldName = FieldPath<QuoteInput>;
type Status = "idle" | "sending" | "error";

export type QuoteFormProps = {
  /** Step to open on (kitchen sink shows steps 2 and 3 statically) */
  initialStep?: Step;
  /** Kitchen sink / screenshots: no sessionStorage, no query prefill, no analytics */
  forceStatic?: boolean;
  /** Kitchen sink states: this step's validation errors, the submit error, the sending state */
  demo?: "errors" | "submit-error" | "sending";
  defaultValues?: Partial<QuoteInput>;
  /** Kitchen sink: static photo thumbnails in every upload state */
  demoPhotos?: PhotoItem[];
  /** "Page source" sent with the lead (defaults to the current path) */
  source?: string;
  className?: string;
};

const EMPTY: QuoteInput = {
  form: "full",
  services: [],
  area: "",
  timeline: null,
  size: "",
  details: "",
  photos: [],
  name: "",
  phone: "",
  email: "",
  contactMethod: null,
  consent: false,
  marketing: false,
};

/* Without JS every step shows at once and the form posts straight to /api/quote */
const NO_JS_CSS = `.qf [data-qf-step][hidden]{display:block!important}.qf [data-qf-submit][hidden]{display:inline-flex!important}.qf [data-qf-nav],.qf [data-qf-rail],.qf [data-qf-photos],.qf [data-qf-progress-vial]{display:none!important}.qf [data-qf-step]+[data-qf-step]{border-top:1px solid var(--hairline)}`;

const subscribeNoop = () => () => {};
/** false on the server and during hydration, true after: enables noValidate only once JS runs */
const useHydrated = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

/**
 * The /free-quote form (brief §12): three steps on a drawing sheet, LevelVial progress, shared zod
 * schema, sessionStorage draft, query prefill, photo uploads, honeypot + fill-time anti-spam.
 * Works without JS as a single long form posting to /api/quote.
 */
export function QuoteForm({
  initialStep = 1,
  forceStatic = false,
  demo,
  defaultValues,
  demoPhotos,
  source,
  className,
}: QuoteFormProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fid = (name: string) => `qf${uid}-${name}`;
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useHydrated();

  const [step, setStep] = useState<Step>(initialStep);
  const [status, setStatus] = useState<Status>(
    demo === "submit-error" ? "error" : demo === "sending" ? "sending" : "idle",
  );

  // Steps the visitor tried to leave (or send): their fields then validate on blur
  const [attempted, setAttempted] = useState<Record<Step, boolean>>(() => ({
    1: demo === "errors" && initialStep === 1,
    2: demo === "errors" && initialStep === 2,
    3: demo === "errors" && initialStep === 3,
  }));
  const markAttempted = (s: Step) => setAttempted((a) => (a[s] ? a : { ...a, [s]: true }));
  const startedAt = useRef(0);
  const started = useRef(false);
  const trackedSteps = useRef(new Set<Step>());
  const pendingFocus = useRef<"heading" | FieldName | null>(null);
  const headings = useRef<Partial<Record<Step, HTMLHeadingElement | null>>>({});
  const photosHandle = useRef<PhotoDropHandle>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const stepRef = useRef<Step>(initialStep);
  const ready = useRef(false);
  const pendingPrefill = useRef<QuotePrefill | null>(null);
  /** The last query prefill applied (a later link may replace its area/size, never typed values) */
  const lastPrefill = useRef<QuotePrefill | null>(null);
  /** What the draft remembers of it, so the same rule holds after a reload */
  const linkFilled = () =>
    lastPrefill.current ? { area: lastPrefill.current.area, size: lastPrefill.current.size } : undefined;

  const {
    register,
    handleSubmit,
    trigger,
    getFieldState,
    getValues,
    setValue,
    setError,
    setFocus,
    reset,
    subscribe,
    formState: { errors },
  } = useForm<QuoteInput, unknown, QuoteOutput>({
    resolver: zodResolver(quoteSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues: { ...EMPTY, ...defaultValues },
  });

  /** Validate on blur once a step has been attempted; clear an error as soon as it's fixed */
  const field = (name: FieldName, s: Step) =>
    register(name, {
      onBlur: () => {
        if (attempted[s]) void trigger(name);
      },
      onChange: () => {
        if (attempted[s] && getFieldState(name).error) void trigger(name);
      },
    });

  const goTo = useCallback(
    (next: Step, focus: "heading" | FieldName = "heading") => {
      pendingFocus.current = focus;
      setStep(next);
      if (!forceStatic && next > 1 && !trackedSteps.current.has(next)) {
        trackedSteps.current.add(next);
        track(next === 2 ? "quote_step_2" : "quote_step_3");
      }
    },
    [forceStatic],
  );

  const goNext = async () => {
    if (step === 3) return;
    markAttempted(step);
    const ok = await trigger([...stepFields[step]], { shouldFocus: true });
    if (ok) goTo((step + 1) as Step);
  };

  const goBack = () => {
    if (step > 1) goTo((step - 1) as Step);
  };

  const markStarted = () => {
    if (started.current || forceStatic) return;
    started.current = true;
    track("quote_start");
  };

  const applyPrefill = useCallback(
    (prefill: QuotePrefill) => {
      if (!ready.current) {
        pendingPrefill.current = prefill;
        return;
      }
      const current = getValues();
      const opts = { shouldDirty: true } as const;
      if (prefill.services.length) {
        setValue("services", [...new Set([...(current.services ?? []), ...prefill.services])], opts);
      }
      // Area and size only fill a field that is empty or still holds the previous link's value:
      // never over something the visitor typed (or restored from their draft).
      const fill = (name: "area" | "size", value?: string) => {
        const now = (current[name] ?? "").trim();
        if (value && (!now || now === lastPrefill.current?.[name])) setValue(name, value, opts);
      };
      fill("area", prefill.area);
      fill("size", prefill.size);
      if (prefill.details && !(current.details ?? "").includes(prefill.details)) {
        setValue("details", current.details ? `${prefill.details}\n${current.details}` : prefill.details, opts);
      }
      lastPrefill.current = prefill;
    },
    [getValues, setValue],
  );

  // Mount: start the fill timer, restore the tab's draft, then apply any query prefill on top
  useEffect(() => {
    startedAt.current = Date.now();
    if (!forceStatic) {
      const draft = loadDraft();
      if (draft) {
        if (draft.startedAt > 0) startedAt.current = Math.min(startedAt.current, draft.startedAt);
        reset({ ...EMPTY, ...draft.values, form: "full" }, { keepDefaultValues: true });
        if (draft.values.photos?.length) photosHandle.current?.restore(draft.values.photos);
        if (draft.prefill) lastPrefill.current = { services: [], ...draft.prefill };
        // Restoring never steals focus or re-sends step events. sessionStorage only exists after
        // hydration, so this one-time sync has to happen in an effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (draft.step === 2 || draft.step === 3) setStep(draft.step);
      }
    }
    ready.current = true;
    if (pendingPrefill.current) {
      applyPrefill(pendingPrefill.current);
      pendingPrefill.current = null;
    }
    if (demo === "errors") void trigger([...stepFields[initialStep]]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, []);

  // Persist the draft (sessionStorage) as values change
  useEffect(() => {
    if (forceStatic) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          saveDraft({ values, step: stepRef.current, startedAt: startedAt.current, prefill: linkFilled() });
        }, 250);
      },
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [forceStatic, subscribe]);

  // Step changed: remember it, save it, move focus to the step heading (or the field to fix)
  useEffect(() => {
    stepRef.current = step;
    if (!forceStatic && ready.current) {
      saveDraft({ values: getValues(), step, startedAt: startedAt.current, prefill: linkFilled() });
    }
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (target === "heading") headings.current[step]?.focus();
    else if (target) setFocus(target);
  }, [step, forceStatic, getValues, setFocus]);

  const onValid = async (values: QuoteOutput) => {
    setStatus("sending");
    const photos = (await photosHandle.current?.settle()) ?? [];
    const result = await submitLead({
      ...values,
      form: "full",
      photos,
      source: source ?? pathname,
      website: honeypot.current?.value ?? "",
      startedAt: startedAt.current || Date.now(),
      submittedAt: Date.now(),
    });

    if (result.ok) {
      rememberFirstName(values.name);
      if (!forceStatic) {
        clearDraft();
        track("quote_submit", { services: values.services.length, photos: photos.length > 0 });
      }
      router.push(result.redirect);
      return;
    }

    if (result.kind === "validation") {
      let first: { step: Step; name: FieldName } | null = null;
      for (const [name, messages] of Object.entries(result.fieldErrors)) {
        const s = stepOfField(name);
        const message = messages?.[0];
        if (!s || !message) continue;
        markAttempted(s);
        setError(name as FieldName, { type: "server", message });
        if (!first || s < first.step) first = { step: s, name: name as FieldName };
      }
      if (first) {
        setStatus("idle");
        if (first.step === step) setFocus(first.name);
        else goTo(first.step, first.name);
        return;
      }
    }
    setStatus("error");
  };

  const onInvalid = (errs: FieldErrors<QuoteInput>) => {
    for (const s of [1, 2, 3] as const) {
      const name = (stepFields[s] as ReadonlyArray<FieldName>).find((n) => errs[n as keyof QuoteInput]);
      if (!name) continue;
      markAttempted(s);
      if (s === step) setFocus(name);
      else goTo(s, name);
      return;
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    if (status === "sending") {
      e.preventDefault();
      return;
    }
    if (step < 3) {
      // Enter on steps 1–2 means "Next", never a premature submit
      e.preventDefault();
      void goNext();
      return;
    }
    markAttempted(3);
    void handleSubmit(onValid, onInvalid)(e);
  };

  const sending = status === "sending";
  const current = quoteSteps[step - 1];
  const errorOf = (name: keyof QuoteInput) => errors[name]?.message as string | undefined;

  // Hatched filler cells complete the last row of the service schedule (2 cols, 3 from @xl)
  const n = services.length;
  const fill2 = (2 - (n % 2)) % 2;
  const fill3 = (3 - (n % 3)) % 3;
  const fillers = Array.from({ length: Math.max(fill2, fill3) }, (_, i) => (
    <HatchCell key={`fill-${i}`} className={cn(i < fill2 ? "block" : "hidden", i < fill3 ? "@xl:block" : "@xl:hidden")} />
  ));

  return (
    <form
      method="post"
      action="/api/quote"
      noValidate={hydrated}
      data-hide-action-bar=""
      onSubmit={onSubmit}
      onFocusCapture={markStarted}
      onPointerDownCapture={markStarted}
      aria-busy={sending || undefined}
      className={cn("qf @container relative", className)}
    >
      <noscript>
        <style>{NO_JS_CSS}</style>
      </noscript>
      <input type="hidden" name="form" value="full" />
      <input type="hidden" name="source" value={source ?? pathname} />
      <Honeypot inputRef={honeypot} />
      {!forceStatic && (
        <Suspense fallback={null}>
          <QueryPrefill onPrefill={applyPrefill} />
        </Suspense>
      )}

      <div className="relative border border-[color:var(--hairline)] bg-[color:var(--surface)]">
        <RegistrationMarks />

        {/* Title block: step counter + spirit level */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-[color:var(--hairline)]">
          <div className="flex min-w-0 flex-col justify-center gap-1.5 px-4 py-4 @2xl:px-6">
            <p className="t-spec tabular-nums">
              Step {step} / {quoteSteps.length}
            </p>
            <p className="text-balance font-display text-[1.0625rem] font-semibold leading-tight [font-stretch:112%] text-[color:var(--ink)]">
              {current.name}
            </p>
          </div>
          <div
            className="flex items-center border-l border-[color:var(--hairline)] px-3 py-3 @sm:px-5"
            data-qf-progress-vial=""
          >
            <LevelVial
              progress={(step - 1) / quoteSteps.length}
              state={sending ? "level" : "progress"}
              className="w-[96px] @xs:w-[118px] @sm:w-[168px]"
            />
          </div>
        </div>

        {/* Step rail: a dimension string across the three steps */}
        <ol className="grid grid-cols-3 border-b border-[color:var(--hairline)]" data-qf-rail="">
          {quoteSteps.map((s) => {
            const isDone = s.n < step;
            const isCurrent = s.n === step;
            const inner = (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-0 top-0 h-0.5 origin-left transition-transform duration-500 ease-[var(--ease-rake)]",
                    "bg-[color:var(--ink)]",
                    isCurrent ? "scale-x-100" : isDone ? "scale-x-100 opacity-40" : "scale-x-0",
                  )}
                />
                <span className="flex items-center gap-2">
                  <span className="tabular-nums">{pad2(s.n)}</span>
                  {isDone && <TickIcon size={12} className="shrink-0" />}
                </span>
                <span className="hidden truncate @md:block">{s.name}</span>
                {isDone && <span className="sr-only">(done)</span>}
              </>
            );
            return (
              <li
                key={s.n}
                aria-current={isCurrent ? "step" : undefined}
                className="relative min-w-0 border-r border-[color:var(--hairline)] last:border-r-0"
              >
                {isDone ? (
                  <button
                    type="button"
                    onClick={() => goTo(s.n)}
                    className="t-spec relative flex min-h-12 w-full min-w-0 flex-col justify-center gap-1 px-3 py-2.5 text-left text-[color:var(--ink)]! transition-colors hover:bg-[color:var(--surface-raised)] @2xl:px-6"
                  >
                    {inner}
                  </button>
                ) : (
                  <span
                    className={cn(
                      "t-spec relative flex min-h-12 min-w-0 flex-col justify-center gap-1 px-3 py-2.5 @2xl:px-6",
                      // Steps ahead keep the spec colour (5.3:1 on plaster); the current one is ink + its top rule
                      isCurrent && "text-[color:var(--ink)]!",
                    )}
                  >
                    {inner}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* ── Step 1: services ─────────────────────────────── */}
        <section hidden={step !== 1} data-qf-step="" aria-labelledby={fid("h1")} className="px-4 pb-8 @2xl:px-6">
          <StepHeading
            id={fid("h1")}
            title={quoteSteps[0].title}
            hint={quoteSteps[0].hint}
            hintId={fid("h1-hint")}
            refCallback={(el) => {
              headings.current[1] = el;
            }}
          />
          <fieldset
            aria-labelledby={fid("h1")}
            aria-describedby={cn(fid("h1-hint"), errorOf("services") && fid("services-error"))}
            className="m-0 min-w-0 border-0 p-0"
          >
            <CellGrid className="grid-cols-2 @xl:grid-cols-3">
              {services.map((service, i) => (
                <ChoiceTile
                  key={service.id}
                  type="checkbox"
                  index={pad2(i + 1)}
                  label={service.formLabel}
                  inputProps={{
                    ...field("services", 1),
                    value: service.id,
                    "aria-invalid": errorOf("services") ? true : undefined,
                  }}
                />
              ))}
              {fillers}
            </CellGrid>
          </fieldset>
          <FieldError id={fid("services-error")} message={errorOf("services")} className="px-0 pb-0 pt-4" />
        </section>

        {/* ── Step 2: project details ──────────────────────── */}
        <section hidden={step !== 2} data-qf-step="" aria-labelledby={fid("h2")} className="px-4 pb-8 @2xl:px-6">
          <StepHeading
            id={fid("h2")}
            title={quoteSteps[1].title}
            refCallback={(el) => {
              headings.current[2] = el;
            }}
          />
          <CellGrid className="grid-cols-1 @xl:grid-cols-2">
            <TextCell
              id={fid("area")}
              label={quoteFields.area.label}
              error={errorOf("area")}
              inputProps={{
                ...field("area", 2),
                placeholder: quoteFields.area.placeholder,
                autoComplete: "postal-code",
                autoCapitalize: "characters",
                enterKeyHint: "next",
                required: true,
                minLength: 2,
                maxLength: 80,
              }}
            />
            <TextCell
              id={fid("size")}
              label={quoteFields.size.label}
              optional={quoteFields.size.optional}
              inputProps={{
                ...field("size", 2),
                placeholder: quoteFields.size.placeholder,
                autoComplete: "off",
                enterKeyHint: "next",
                maxLength: 120,
              }}
            />
            <ChoiceGroupCell id={fid("timeline")} label={quoteFields.timeline.label} className="@xl:col-span-2">
              <CellGrid className="grid-cols-1 @xs:grid-cols-2 @3xl:grid-cols-4">
                {quoteFields.timeline.options.map((o) => (
                  <ChoiceTile
                    key={o.value}
                    type="radio"
                    size="sm"
                    label={o.label}
                    inputProps={{ ...field("timeline", 2), value: o.value }}
                  />
                ))}
              </CellGrid>
            </ChoiceGroupCell>
            <TextareaCell
              id={fid("details")}
              label={quoteFields.details.label}
              className="@xl:col-span-2"
              textareaProps={{
                ...field("details", 2),
                placeholder: quoteFields.details.placeholder,
                rows: 5,
                maxLength: 4000,
              }}
            />
            <PhotoDrop
              id={fid("photos")}
              className="@xl:col-span-2"
              handleRef={photosHandle}
              demoItems={demoPhotos}
              onChange={(photos) => setValue("photos", photos, { shouldDirty: true })}
            />
          </CellGrid>
        </section>

        {/* ── Step 3: contact ──────────────────────────────── */}
        <section hidden={step !== 3} data-qf-step="" aria-labelledby={fid("h3")} className="px-4 pb-8 @2xl:px-6">
          <StepHeading
            id={fid("h3")}
            title={quoteSteps[2].title}
            refCallback={(el) => {
              headings.current[3] = el;
            }}
          />
          <CellGrid className="grid-cols-1 @xl:grid-cols-2">
            <TextCell
              id={fid("name")}
              label={quoteFields.name.label}
              error={errorOf("name")}
              className="@xl:col-span-2"
              inputProps={{
                ...field("name", 3),
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
                ...field("phone", 3),
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
                ...field("email", 3),
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
            <ChoiceGroupCell id={fid("contact")} label={quoteFields.contactMethod.label} className="@xl:col-span-2">
              <CellGrid className="grid-cols-1 @sm:grid-cols-3">
                {quoteFields.contactMethod.options.map((o) => (
                  <ChoiceTile
                    key={o.value}
                    type="radio"
                    size="sm"
                    label={o.label}
                    inputProps={{ ...field("contactMethod", 3), value: o.value }}
                  />
                ))}
              </CellGrid>
            </ChoiceGroupCell>
            <CheckCell
              id={fid("consent")}
              error={errorOf("consent")}
              className="@xl:col-span-2"
              inputProps={{ ...field("consent", 3), required: true }}
            >
              {quoteFields.consent.before}
              <a href={quoteFields.consent.href} className="link-inline font-medium">
                {quoteFields.consent.link}
              </a>
              {quoteFields.consent.after}
            </CheckCell>
            <CheckCell id={fid("marketing")} className="@xl:col-span-2" inputProps={field("marketing", 3)}>
              {quoteFields.marketing.label}
            </CheckCell>
          </CellGrid>
        </section>

        {status === "error" && (
          <div
            role="alert"
            className="mx-4 mb-6 flex items-start gap-3 border border-[color:var(--error)] px-4 py-3.5 text-[color:var(--error)] @2xl:mx-6"
          >
            <RevisionMark className="mt-1" />
            <p className="text-[0.9375rem] font-medium leading-snug">
              {quoteErrors.generic.before}
              <CallLink location="quote-form-error" className="link-inline text-[color:var(--ink)]">
                {site.phone.display}
              </CallLink>
              {quoteErrors.generic.after}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--hairline)] px-4 py-4 @2xl:px-6">
          <div data-qf-nav="">
            {step > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={goBack}
                disabled={sending}
                icon={<ArrowIcon className="rotate-180 transition-transform duration-300 group-hover/btn:-translate-x-1" />}
              >
                {quoteButtons.back}
              </Button>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span data-qf-nav="" hidden={step === 3} className="contents">
              <Button type="button" onClick={() => void goNext()} arrow>
                {quoteButtons.next}
              </Button>
            </span>
            <span data-qf-submit="" hidden={step !== 3} className="contents">
              <Button type="submit" loading={sending} arrow={!sending}>
                {quoteButtons.submit}
              </Button>
            </span>
          </div>
        </div>
      </div>
    </form>
  );
}

function StepHeading({
  id,
  title,
  hint,
  hintId,
  refCallback,
}: {
  id: string;
  title: string;
  hint?: string;
  hintId?: string;
  refCallback: (el: HTMLHeadingElement | null) => void;
}) {
  return (
    <div className="pb-6 pt-7 @2xl:pt-9">
      <h2 id={id} ref={refCallback} tabIndex={-1} className="t-h3 scroll-mt-32 text-[color:var(--ink)]">
        {title}
      </h2>
      {hint && (
        <p id={hintId} className="mt-2 text-[0.9375rem] text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}

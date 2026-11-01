"use client";

/* Client-side demos for the UiKit kitchen-sink partial (dev only). */
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { clearToasts, toast, ToastCard, ToastRegion } from "@/components/ui/Toast";
import { genericErrorText, quoteErrors, quoteFields } from "@/content/copy/forms";
import { estimator, finishLevelIds, type FinishLevel } from "@/content/pricing";
import { formatCAD } from "@/lib/utils";

export function ToastDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ title: quoteFields.photos.hint, tone: "info" })}
      >
        Info toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ title: "Level. We've got it.", body: "We review your details and photos.", tone: "success" })}
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => toast({ title: quoteErrors.photos, body: genericErrorText, tone: "error" })}
      >
        Error toast
      </Button>
      <Button variant="ghost" onClick={() => clearToasts()}>
        Clear all
      </Button>
      <ToastRegion />
    </div>
  );
}

const noop = () => {};

/** Static toast cards (frozen countdowns) for screenshots of every tone. */
export function ToastStaticCards() {
  return (
    <div className="grid max-w-5xl gap-6 md:grid-cols-2">
      <ToastCard tone="info" title={quoteFields.photos.hint} progress={0.72} onDismiss={noop} />
      <ToastCard
        tone="success"
        title="Level. We've got it."
        body="We review your details and photos."
        progress={0.4}
        onDismiss={noop}
      />
      <ToastCard tone="error" title={quoteErrors.photos} body={genericErrorText} progress={0.9} onDismiss={noop} />
      <ToastCard tone="success" title="Level. We've got it." />
    </div>
  );
}

const levelOptions = finishLevelIds.map((id) => {
  const level = estimator.finishLevels[id];
  return {
    value: id,
    label: level.label,
    hint: `${formatCAD(level.perSqFt.low)}–${formatCAD(level.perSqFt.high)} / sq ft`,
  };
});

export function ControlledSegmentDemo() {
  const [level, setLevel] = useState<FinishLevel>("comfort");
  return (
    <div className="space-y-3">
      <SegmentedControl<FinishLevel>
        legend="Finish level (controlled)"
        options={levelOptions}
        value={level}
        onValueChange={setLevel}
        name="ks-finish-level"
      />
      <p className="t-spec">
        value: <span className="text-[color:var(--ink)]">{level}</span>
      </p>
    </div>
  );
}

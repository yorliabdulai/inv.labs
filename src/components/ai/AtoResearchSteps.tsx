"use client";

import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import type { ResearchStep } from "@/lib/ai/research/types";

export function AtoResearchSteps({ steps }: { steps: ResearchStep[] }) {
  if (steps.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-muted/10 p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Research progress
      </p>
      <ul className="space-y-2.5">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-2.5 text-sm">
            <StepIcon status={step.status} />
            <span
              className={
                step.status === "running"
                  ? "text-foreground font-medium"
                  : step.status === "error"
                    ? "text-muted-foreground"
                    : "text-foreground/80"
              }
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepIcon({ status }: { status: ResearchStep["status"] }) {
  if (status === "running") {
    return <Loader2 size={16} className="text-primary animate-spin shrink-0 mt-0.5" />;
  }
  if (status === "done") {
    return <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />;
  }
  if (status === "error") {
    return <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />;
  }
  return <Circle size={16} className="text-muted-foreground/40 shrink-0 mt-0.5" />;
}

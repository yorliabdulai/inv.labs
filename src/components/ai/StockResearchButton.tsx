"use client";

import { Sparkles } from "lucide-react";
import { useAtoResearch } from "./AtoResearchContext";
import { isAtoDeepResearchEnabled } from "@/lib/config/feature-flags";

type Props = {
  symbol: string;
  companyName?: string;
  variant?: "compact" | "default";
  className?: string;
};

export function StockResearchButton({
  symbol,
  companyName,
  variant = "default",
  className = "",
}: Props) {
  const { openResearch } = useAtoResearch();

  if (!isAtoDeepResearchEnabled()) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openResearch({ symbol, companyName });
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline ${className}`}
      >
        <Sparkles size={10} />
        Research
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`px-3 py-2 rounded-xl border border-primary/30 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 hover:bg-primary/10 active:scale-95 ${className}`}
    >
      <Sparkles size={12} />
      Research
    </button>
  );
}

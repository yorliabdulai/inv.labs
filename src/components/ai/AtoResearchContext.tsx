"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AtoResearchPanel } from "./AtoResearchPanel";

type ResearchRequest = {
  symbol?: string;
  companyName?: string;
  query?: string;
};

type AtoResearchContextValue = {
  openResearch: (req?: ResearchRequest) => void;
  closeResearch: () => void;
};

const AtoResearchContext = createContext<AtoResearchContextValue | null>(null);

export function AtoResearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [request, setRequest] = useState<ResearchRequest>({});

  const openResearch = useCallback((req: ResearchRequest = {}) => {
    setRequest(req);
    setOpen(true);
  }, []);

  const closeResearch = useCallback(() => setOpen(false), []);

  return (
    <AtoResearchContext.Provider value={{ openResearch, closeResearch }}>
      {children}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-syne">Ato Research</SheetTitle>
            <SheetDescription>
              {request.symbol
                ? `Deep analysis for ${request.companyName || request.symbol}`
                : "Ghana market deep research with citations"}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 pb-8">
            <AtoResearchPanel
              symbol={request.symbol}
              companyName={request.companyName}
              initialQuery={request.query}
            />
          </div>
        </SheetContent>
      </Sheet>
    </AtoResearchContext.Provider>
  );
}

export function useAtoResearch() {
  const ctx = useContext(AtoResearchContext);
  if (!ctx) {
    throw new Error("useAtoResearch must be used within AtoResearchProvider");
  }
  return ctx;
}

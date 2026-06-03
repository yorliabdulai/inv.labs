"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Maximize2 } from "lucide-react";
import { AtoFloatingButton } from "./AtoFloatingButton";
import { AtoChat } from "./AtoChat";
import { useAtoResearch } from "./AtoResearchContext";

function AtoChatContainerInner() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [initialResearchSymbol, setInitialResearchSymbol] = useState<string | undefined>();
  const [openInResearch, setOpenInResearch] = useState(false);
  const searchParams = useSearchParams();
  const { openResearch } = useAtoResearch();

  useEffect(() => {
    const showAto = searchParams.get("showAto") === "true";
    const researchSymbol = searchParams.get("research")?.toUpperCase();
    if (showAto) {
      setIsMinimized(false);
      setIsChatOpen(true);
    }
    if (researchSymbol) {
      setInitialResearchSymbol(researchSymbol);
      setOpenInResearch(true);
      setIsChatOpen(true);
      openResearch({ symbol: researchSymbol });
    }
  }, [searchParams, openResearch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "j" || e.key === "K" || e.key === "J")) {
        e.preventDefault();
        if (isMinimized) {
          setIsMinimized(false);
        } else {
          setIsChatOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMinimized]);

  const handleOpen = useCallback(() => {
    setIsMinimized(false);
    setIsChatOpen(true);
  }, []);

  const handleClose = () => {
    setIsChatOpen(false);
    setIsMinimized(false);
    setOpenInResearch(false);
    setInitialResearchSymbol(undefined);
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  return (
    <>
      {!isChatOpen && !isMinimized && <AtoFloatingButton onClick={handleOpen} />}

      {isMinimized && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-full shadow-xl backdrop-blur-sm hover:bg-muted/60 transition-all active:scale-95"
          aria-label="Restore Ato chat"
        >
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="text-xs font-bold text-foreground uppercase tracking-widest">Ato</span>
          <Maximize2 size={13} className="text-muted-foreground" />
        </button>
      )}

      <AtoChat
        isOpen={isChatOpen && !isMinimized}
        onClose={handleClose}
        onMinimize={handleMinimize}
        initialView={openInResearch ? "research" : "chat"}
        initialResearchSymbol={initialResearchSymbol}
      />
    </>
  );
}

export function AtoChatContainer() {
  return <AtoChatContainerInner />;
}

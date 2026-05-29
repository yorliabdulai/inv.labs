"use client";

interface AtoModeSwitcherProps {
  mode: "chat" | "agent";
  onChange: (mode: "chat" | "agent") => void;
  isAgentEnabled: boolean;
}

export function AtoModeSwitcher({ mode, onChange, isAgentEnabled }: AtoModeSwitcherProps) {
  if (!isAgentEnabled) return null;

  return (
    <div className="fixed bottom-[110px] right-6 z-[55] hidden md:flex items-center gap-1 px-1.5 py-1 bg-card/95 border border-border rounded-full shadow-lg backdrop-blur-md">
      <button
        type="button"
        onClick={() => onChange("chat")}
        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
          mode === "chat"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Chat
      </button>
      <button
        type="button"
        onClick={() => onChange("agent")}
        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
          mode === "agent"
            ? "bg-amber-500 text-white"
            : "text-amber-600 hover:text-amber-700"
        }`}
      >
        Agent
      </button>
    </div>
  );
}


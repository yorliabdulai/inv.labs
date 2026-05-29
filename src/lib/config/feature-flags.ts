export function isAtoAgentModeEnabled() {
  // Public flag because it affects client-side UI.
  return process.env.NEXT_PUBLIC_ATO_AGENT_MODE_ENABLED === "true";
}


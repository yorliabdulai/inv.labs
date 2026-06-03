export function isAtoDeepResearchEnabled() {
  return (
    process.env.NEXT_PUBLIC_ATO_DEEP_RESEARCH_ENABLED === "true" ||
    process.env.NEXT_PUBLIC_ATO_AGENT_MODE_ENABLED === "true"
  );
}

/** @deprecated Use isAtoDeepResearchEnabled */
export function isAtoAgentModeEnabled() {
  return isAtoDeepResearchEnabled();
}

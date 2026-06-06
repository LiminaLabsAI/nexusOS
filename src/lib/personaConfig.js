/**
 * Per-persona configuration for domain filtering and layout customisation.
 * Used by Intelligence Feed, Alerts, and Recommendations pages.
 */

export const PERSONA_CONFIG = {
  ceo: {
    label: 'CEO',
    domains: [], // all domains
    prioritySeverities: ['critical', 'warning'],
    defaultFilter: 'all',
    showFinancialImpact: true,
    showExecutionSteps: false,
    showRiskFlags: true,
    showAlternatives: false,
    showRootCause: false,
    bannerColor: 'from-blue-500/10 to-transparent',
    bannerText: 'Executive Overview — cross-domain critical signals',
  },
  coo: {
    label: 'COO',
    domains: ['operations', 'manufacturing', 'logistics'],
    prioritySeverities: ['critical', 'warning', 'info'],
    defaultFilter: 'all',
    showFinancialImpact: true,
    showExecutionSteps: true,
    showRiskFlags: true,
    showAlternatives: true,
    showRootCause: true,
    bannerColor: 'from-emerald-500/10 to-transparent',
    bannerText: 'Operations & Supply Chain intelligence',
  },
  cfo: {
    label: 'CFO',
    domains: ['finance'],
    prioritySeverities: ['critical', 'warning', 'info'],
    defaultFilter: 'all',
    showFinancialImpact: true,
    showExecutionSteps: false,
    showRiskFlags: true,
    showAlternatives: false,
    showRootCause: false,
    bannerColor: 'from-amber-500/10 to-transparent',
    bannerText: 'Finance domain signals and risk exposure',
  },
  plant_manager: {
    label: 'Plant Manager',
    domains: ['manufacturing', 'operations'],
    prioritySeverities: ['critical', 'warning', 'info'],
    defaultFilter: 'alerts',
    showFinancialImpact: false,
    showExecutionSteps: true,
    showRiskFlags: true,
    showAlternatives: false,
    showRootCause: true,
    bannerColor: 'from-orange-500/10 to-transparent',
    bannerText: 'Manufacturing & Operations floor intelligence',
  },
  supply_chain: {
    label: 'Supply Chain',
    domains: ['logistics', 'manufacturing', 'operations'],
    prioritySeverities: ['critical', 'warning', 'info'],
    defaultFilter: 'all',
    showFinancialImpact: true,
    showExecutionSteps: true,
    showRiskFlags: true,
    showAlternatives: true,
    showRootCause: true,
    bannerColor: 'from-cyan-500/10 to-transparent',
    bannerText: 'Supply chain & logistics signals',
  },
  operations: {
    label: 'Operations Mgr',
    domains: ['operations', 'manufacturing'],
    prioritySeverities: ['critical', 'warning', 'info'],
    defaultFilter: 'alerts',
    showFinancialImpact: false,
    showExecutionSteps: true,
    showRiskFlags: false,
    showAlternatives: false,
    showRootCause: true,
    bannerColor: 'from-blue-400/10 to-transparent',
    bannerText: 'Operational alerts and action items',
  },
  analyst: {
    label: 'Analyst',
    domains: [],
    prioritySeverities: ['critical', 'warning', 'info'],
    defaultFilter: 'all',
    showFinancialImpact: true,
    showExecutionSteps: true,
    showRiskFlags: true,
    showAlternatives: true,
    showRootCause: true,
    bannerColor: 'from-violet-500/10 to-transparent',
    bannerText: 'Full intelligence view — read only',
  },
  // fallback for admin, user, etc.
  default: {
    label: 'All',
    domains: [],
    prioritySeverities: ['critical', 'warning', 'info'],
    defaultFilter: 'all',
    showFinancialImpact: true,
    showExecutionSteps: true,
    showRiskFlags: true,
    showAlternatives: true,
    showRootCause: true,
    bannerColor: 'from-primary/10 to-transparent',
    bannerText: '',
  },
};

export function getPersonaConfig(persona) {
  return PERSONA_CONFIG[persona] || PERSONA_CONFIG.default;
}

/**
 * Filter an array of items by the persona's allowed domains.
 * Empty domains array = show all.
 */
export function filterByPersona(items, persona) {
  const config = getPersonaConfig(persona);
  if (!config.domains.length) return items;
  return items.filter(item => !item.domain || config.domains.includes(item.domain));
}
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
    simulation: {
      bannerText: 'Strategic scenario modeling — cross-domain, executive focus',
      defaultDomain: 'finance',
      allowedDomains: ['manufacturing', 'logistics', 'retail', 'finance', 'operations'],
      showVariableDetail: false,       // hide low-level variable rows
      showBestWorstCase: true,
      showConfidence: true,
      promptFocus: 'Focus on strategic business impact, revenue, market position, and board-level risk. Use executive language. Summarise technical detail.',
    },
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
    simulation: {
      bannerText: 'Operational scenario lab — manufacturing, logistics & operations',
      defaultDomain: 'operations',
      allowedDomains: ['manufacturing', 'logistics', 'operations'],
      showVariableDetail: true,
      showBestWorstCase: true,
      showConfidence: true,
      promptFocus: 'Focus on operational efficiency, throughput, supply chain resilience, and execution timelines. Include specific KPIs and process metrics.',
    },
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
    simulation: {
      bannerText: 'Financial scenario modeling — P&L, cash flow & risk exposure',
      defaultDomain: 'finance',
      allowedDomains: ['finance'],
      showVariableDetail: true,
      showBestWorstCase: true,
      showConfidence: true,
      promptFocus: 'Focus on financial impact: P&L, EBITDA, cash flow, cost savings, revenue risk, and compliance implications. Use precise financial language with dollar figures.',
    },
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
/**
 * Per-persona configuration for domain filtering and layout customisation.
 * Used by Intelligence Feed, Alerts, Recommendations, and Scenarios pages.
 */

/**
 * Pre-seeded scenario templates grouped by category for each C-suite role.
 * Each group has a label and an array of scenario templates.
 */
export const PERSONA_SCENARIO_GROUPS = {
  ceo: [
    {
      group: 'Growth & Revenue',
      scenarios: [
        {
          name: 'Market Expansion — APAC Entry',
          description: 'Model the revenue and cost impact of entering two new APAC markets in Q3.',
          domain: 'retail',
          variables: [
            { name: 'New Market Revenue', current_value: 0, simulated_value: 18000000, unit: '$' },
            { name: 'Expansion CAPEX', current_value: 0, simulated_value: 5000000, unit: '$' },
            { name: 'Time to Breakeven', current_value: 0, simulated_value: 18, unit: 'mo' },
          ],
        },
        {
          name: 'Pricing Strategy — 8% Price Increase',
          description: 'Assess demand elasticity and net revenue impact of an 8% across-the-board price increase.',
          domain: 'finance',
          variables: [
            { name: 'Price Increase', current_value: 0, simulated_value: 8, unit: '%' },
            { name: 'Estimated Volume Decline', current_value: 0, simulated_value: 4, unit: '%' },
          ],
        },
      ],
    },
    {
      group: 'Risk & Resilience',
      scenarios: [
        {
          name: 'Key Supplier Failure — Tier-1 Disruption',
          description: 'Board-level impact if our primary Tier-1 supplier goes offline for 6 weeks.',
          domain: 'manufacturing',
          variables: [
            { name: 'Outage Duration', current_value: 0, simulated_value: 6, unit: 'wk' },
            { name: 'Lost Revenue', current_value: 0, simulated_value: 12000000, unit: '$' },
            { name: 'Alternative Sourcing Cost', current_value: 0, simulated_value: 2500000, unit: '$' },
          ],
        },
        {
          name: 'Regulatory Change — Carbon Tax Impact',
          description: 'Quantify P&L exposure from proposed 15% carbon tax on manufacturing operations.',
          domain: 'finance',
          variables: [
            { name: 'Carbon Tax Rate', current_value: 0, simulated_value: 15, unit: '%' },
            { name: 'Annual Cost Increase', current_value: 0, simulated_value: 3200000, unit: '$' },
          ],
        },
      ],
    },
    {
      group: 'Workforce & M&A',
      scenarios: [
        {
          name: 'Acquisition Integration — TechCo Merger',
          description: 'Model synergy realisation and integration costs over a 24-month post-merger period.',
          domain: 'finance',
          variables: [
            { name: 'Integration Cost', current_value: 0, simulated_value: 8000000, unit: '$' },
            { name: 'Annual Synergies', current_value: 0, simulated_value: 15000000, unit: '$' },
            { name: 'Integration Timeline', current_value: 0, simulated_value: 24, unit: 'mo' },
          ],
        },
      ],
    },
  ],
  coo: [
    {
      group: 'Supply Chain',
      scenarios: [
        {
          name: 'Lead Time Reduction — Supplier Nearshoring',
          description: 'Simulate effect of moving 30% of sourcing to nearshore suppliers on lead times and costs.',
          domain: 'logistics',
          variables: [
            { name: 'Nearshore %', current_value: 0, simulated_value: 30, unit: '%' },
            { name: 'Lead Time Reduction', current_value: 45, simulated_value: 18, unit: 'days' },
            { name: 'Unit Cost Increase', current_value: 0, simulated_value: 3.2, unit: '$' },
          ],
        },
        {
          name: 'Safety Stock Optimisation',
          description: 'Model the inventory cost vs stockout risk trade-off if safety stock is reduced by 20%.',
          domain: 'logistics',
          variables: [
            { name: 'Safety Stock Reduction', current_value: 0, simulated_value: 20, unit: '%' },
            { name: 'Carrying Cost Savings', current_value: 0, simulated_value: 1400000, unit: '$' },
            { name: 'Stockout Risk Increase', current_value: 2, simulated_value: 6, unit: '%' },
          ],
        },
      ],
    },
    {
      group: 'Manufacturing Throughput',
      scenarios: [
        {
          name: 'Line Speed — 15% OEE Improvement',
          description: 'Forecast output and cost impact if Overall Equipment Effectiveness rises from 72% to 87%.',
          domain: 'manufacturing',
          variables: [
            { name: 'OEE Current', current_value: 72, simulated_value: 87, unit: '%' },
            { name: 'Additional Units/Day', current_value: 0, simulated_value: 320, unit: 'units' },
            { name: 'Maintenance Investment', current_value: 0, simulated_value: 750000, unit: '$' },
          ],
        },
        {
          name: 'Shift Pattern Change — 24/7 Operations',
          description: 'Evaluate throughput gain and labour cost of moving to round-the-clock production.',
          domain: 'manufacturing',
          variables: [
            { name: 'Additional Shifts', current_value: 2, simulated_value: 3, unit: 'shifts' },
            { name: 'Labour Cost Increase', current_value: 0, simulated_value: 2100000, unit: '$' },
            { name: 'Throughput Increase', current_value: 0, simulated_value: 35, unit: '%' },
          ],
        },
      ],
    },
    {
      group: 'Operational Efficiency',
      scenarios: [
        {
          name: 'Warehouse Automation — Robotics Rollout',
          description: 'Model ROI and headcount impact of deploying autonomous picking robots in 3 DCs.',
          domain: 'operations',
          variables: [
            { name: 'CAPEX Investment', current_value: 0, simulated_value: 6000000, unit: '$' },
            { name: 'Labour Cost Reduction', current_value: 0, simulated_value: 1800000, unit: '$/yr' },
            { name: 'Pick Accuracy Gain', current_value: 96, simulated_value: 99.7, unit: '%' },
          ],
        },
      ],
    },
  ],
  administrator: [
    {
      group: 'Platform & System Governance',
      scenarios: [
        {
          name: 'User Growth — Platform Scaling',
          description: 'Model infrastructure cost and performance impact of 3x user base growth over 12 months.',
          domain: 'operations',
          variables: [
            { name: 'Current Users', current_value: 500, simulated_value: 1500, unit: '' },
            { name: 'Infra Cost Increase', current_value: 0, simulated_value: 120000, unit: '$' },
            { name: 'Latency Impact', current_value: 80, simulated_value: 140, unit: 'ms' },
          ],
        },
        {
          name: 'Role Proliferation — Access Governance Audit',
          description: 'Assess security exposure risk if unchecked custom role creation exceeds governance thresholds.',
          domain: 'hr',
          variables: [
            { name: 'Custom Roles', current_value: 5, simulated_value: 40, unit: '' },
            { name: 'Audit Effort', current_value: 0, simulated_value: 160, unit: 'hrs' },
            { name: 'Risk Score Increase', current_value: 10, simulated_value: 68, unit: 'pts' },
          ],
        },
      ],
    },
    {
      group: 'Cross-Domain Risk & Compliance',
      scenarios: [
        {
          name: 'Data Breach Scenario — GDPR Exposure',
          description: 'Estimate financial and reputational impact of a mid-scale data breach across all domains.',
          domain: 'finance',
          variables: [
            { name: 'Records Exposed', current_value: 0, simulated_value: 50000, unit: '' },
            { name: 'Regulatory Fine', current_value: 0, simulated_value: 4000000, unit: '$' },
            { name: 'Remediation Cost', current_value: 0, simulated_value: 1200000, unit: '$' },
          ],
        },
        {
          name: 'AI Agent Autonomy — Escalation Policy Change',
          description: 'Model risk exposure if AI agents are allowed to auto-execute recommendations without human approval.',
          domain: 'operations',
          variables: [
            { name: 'Auto-Execute Rate', current_value: 0, simulated_value: 60, unit: '%' },
            { name: 'Error Incident Rate', current_value: 0.5, simulated_value: 4, unit: '%' },
            { name: 'Estimated Annual Loss', current_value: 0, simulated_value: 800000, unit: '$' },
          ],
        },
      ],
    },
    {
      group: 'Operational Transformation',
      scenarios: [
        {
          name: 'Full Enterprise Rollout — All Business Units',
          description: 'Simulate adoption curve and ROI of deploying NexusOS across all 8 business units.',
          domain: 'finance',
          variables: [
            { name: 'Business Units', current_value: 2, simulated_value: 8, unit: '' },
            { name: 'Rollout Duration', current_value: 0, simulated_value: 9, unit: 'mo' },
            { name: 'Annual Value Realised', current_value: 0, simulated_value: 22000000, unit: '$' },
          ],
        },
      ],
    },
  ],
  cfo: [
    {
      group: 'P&L Scenarios',
      scenarios: [
        {
          name: 'Cost Reduction — OpEx 10% Cut',
          description: 'Model EBITDA uplift from a structured 10% operating expenditure reduction programme.',
          domain: 'finance',
          variables: [
            { name: 'OpEx Reduction', current_value: 0, simulated_value: 10, unit: '%' },
            { name: 'Annual Savings', current_value: 0, simulated_value: 4500000, unit: '$' },
            { name: 'Restructuring Charge', current_value: 0, simulated_value: 800000, unit: '$' },
          ],
        },
        {
          name: 'Revenue Mix Shift — Services Growth',
          description: 'Assess gross margin impact of growing high-margin services from 22% to 35% of revenue.',
          domain: 'finance',
          variables: [
            { name: 'Services Revenue %', current_value: 22, simulated_value: 35, unit: '%' },
            { name: 'Gross Margin Impact', current_value: 0, simulated_value: 3, unit: '%pts' },
          ],
        },
      ],
    },
    {
      group: 'Cash Flow & Liquidity',
      scenarios: [
        {
          name: 'Working Capital Optimisation',
          description: 'Model cash release from reducing DSO by 8 days and DPO extension by 10 days.',
          domain: 'finance',
          variables: [
            { name: 'DSO Reduction', current_value: 48, simulated_value: 40, unit: 'days' },
            { name: 'DPO Extension', current_value: 30, simulated_value: 40, unit: 'days' },
            { name: 'Cash Release', current_value: 0, simulated_value: 7200000, unit: '$' },
          ],
        },
        {
          name: 'Interest Rate Sensitivity — +200bps',
          description: 'Stress-test the debt portfolio against a 200 basis point rate rise.',
          domain: 'finance',
          variables: [
            { name: 'Rate Increase', current_value: 0, simulated_value: 2, unit: '%' },
            { name: 'Additional Interest Cost', current_value: 0, simulated_value: 1600000, unit: '$' },
            { name: 'Variable Debt Exposure', current_value: 80000000, simulated_value: 80000000, unit: '$' },
          ],
        },
      ],
    },
    {
      group: 'Capital Allocation',
      scenarios: [
        {
          name: 'CAPEX Deferral — 12-Month Freeze',
          description: 'Free cash flow impact of deferring all discretionary CAPEX for 12 months.',
          domain: 'finance',
          variables: [
            { name: 'Deferred CAPEX', current_value: 0, simulated_value: 9500000, unit: '$' },
            { name: 'FCF Improvement', current_value: 0, simulated_value: 9500000, unit: '$' },
            { name: 'Asset Age Impact', current_value: 0, simulated_value: 4, unit: 'pts OEE' },
          ],
        },
      ],
    },
  ],
};

// Admin scenario groups added at end of PERSONA_SCENARIO_GROUPS object
// (appended before the export of PERSONA_CONFIG below)

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
  administrator: {
    label: 'Administrator',
    domains: [], // all domains — full visibility
    prioritySeverities: ['critical', 'warning', 'info'],
    defaultFilter: 'all',
    showFinancialImpact: true,
    showExecutionSteps: true,
    showRiskFlags: true,
    showAlternatives: true,
    showRootCause: true,
    bannerColor: 'from-amber-500/10 to-transparent',
    bannerText: 'System-wide view — all domains, all users, full platform intelligence',
    // Intelligence Feed groups
    intelligenceGroups: [
      { key: 'security', label: 'Security & Access', match: (item) => ['hr', 'operations'].includes(item.domain) },
      { key: 'critical', label: 'Critical Platform Alerts', match: (item) => item.severity === 'critical' || item.priority === 'critical' },
      { key: 'governance', label: 'Governance & Compliance', match: (item) => ['finance'].includes(item.domain) },
      { key: 'operational', label: 'Operational Intelligence', match: (item) => ['manufacturing', 'logistics', 'operations'].includes(item.domain) },
      { key: 'commercial', label: 'Commercial & Retail', match: (item) => ['retail'].includes(item.domain) },
    ],
    // Alerts groups
    alertGroups: [
      { key: 'critical', label: 'Critical — Immediate Action', filter: (a) => a.severity === 'critical' && a.status === 'new' },
      { key: 'access', label: 'Access & Security', filter: (a) => ['hr'].includes(a.domain) },
      { key: 'compliance', label: 'Compliance & Finance', filter: (a) => ['finance'].includes(a.domain) },
      { key: 'operations', label: 'Operations & Supply Chain', filter: (a) => ['manufacturing', 'logistics', 'operations'].includes(a.domain) },
      { key: 'commercial', label: 'Commercial', filter: (a) => ['retail'].includes(a.domain) },
      { key: 'resolved', label: 'Resolved / Dismissed', filter: (a) => ['resolved', 'dismissed'].includes(a.status) },
    ],
    // Recommendations groups
    recGroups: [
      { key: 'pending_critical', label: 'Awaiting Approval — Critical', filter: (r) => r.status === 'pending' && r.priority === 'critical' },
      { key: 'pending', label: 'Pending Review', filter: (r) => r.status === 'pending' && r.priority !== 'critical' },
      { key: 'in_flight', label: 'In-Flight (Approved / Executing)', filter: (r) => ['approved', 'executing'].includes(r.status) },
      { key: 'completed', label: 'Completed', filter: (r) => r.status === 'completed' },
      { key: 'rejected', label: 'Rejected / Failed', filter: (r) => ['rejected', 'failed'].includes(r.status) },
    ],
    simulation: {
      bannerText: 'Platform-wide scenario modeling — system, governance & cross-domain impact',
      defaultDomain: 'finance',
      allowedDomains: ['manufacturing', 'logistics', 'retail', 'finance', 'hr', 'operations'],
      showVariableDetail: true,
      showBestWorstCase: true,
      showConfidence: true,
      promptFocus: 'Focus on platform-wide business impact, cross-domain risk, compliance, governance, user impact, and system resilience. Include financial, operational, and strategic dimensions.',
    },
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
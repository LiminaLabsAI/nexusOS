// Fully self-contained mock client for Nexus OS, replacing the @base44/sdk dependency.
// Data is stored in localStorage to allow full client-side execution, updates, and CRUD persistence.

const SEED_USERS = [
  { id: 'usr-1', email: 'admin@nexusos.com', name: 'Sarang (Admin)', role: 'admin' },
  { id: 'usr-2', email: 'ceo@nexusos.com', name: 'Chief Executive Officer', role: 'ceo' },
  { id: 'usr-3', email: 'coo@nexusos.com', name: 'Chief Operating Officer', role: 'coo' },
  { id: 'usr-4', email: 'cfo@nexusos.com', name: 'Chief Financial Officer', role: 'cfo' },
];

const SEED_KPIS = [
  { id: 'kpi-1', name: 'Inventory Turns', current_value: 6.2, previous_value: 5.8, unit: 'x', trend: 'up', status: 'healthy', domain: 'logistics', sparkline_data: [5.8, 5.9, 6.0, 5.9, 6.1, 6.2] },
  { id: 'kpi-2', name: 'Avg. Lead Time', current_value: 18, previous_value: 22, unit: 'days', trend: 'down', status: 'healthy', domain: 'logistics', sparkline_data: [22, 21, 20, 19, 19, 18] },
  { id: 'kpi-3', name: 'Capacity Utilization', current_value: 87.5, previous_value: 85.0, unit: '%', trend: 'up', status: 'healthy', domain: 'manufacturing', sparkline_data: [85, 85.5, 86, 86.8, 87, 87.5] },
  { id: 'kpi-4', name: 'Order Accuracy', current_value: 98.4, previous_value: 97.9, unit: '%', trend: 'up', status: 'healthy', domain: 'logistics', sparkline_data: [97.9, 98.0, 98.2, 98.1, 98.3, 98.4] },
  { id: 'kpi-5', name: 'Cost of Goods Sold', current_value: 12400000, previous_value: 13100000, unit: '$', trend: 'down', status: 'healthy', domain: 'finance', sparkline_data: [13.1, 13.0, 12.8, 12.7, 12.5, 12.4] },
  { id: 'kpi-6', name: 'Revenue Growth', current_value: 14.8, previous_value: 12.2, unit: '%', trend: 'up', status: 'healthy', domain: 'finance', sparkline_data: [12.2, 12.8, 13.5, 14.0, 14.2, 14.8] },
  { id: 'kpi-7', name: 'Defect Rate', current_value: 0.45, previous_value: 0.52, unit: '%', trend: 'down', status: 'healthy', domain: 'manufacturing', sparkline_data: [0.52, 0.50, 0.48, 0.47, 0.46, 0.45] },
  { id: 'kpi-8', name: 'Critical Asset Temp', current_value: 94.2, previous_value: 82.1, unit: '°C', trend: 'up', status: 'critical', domain: 'manufacturing', sparkline_data: [82.1, 84.5, 87.0, 89.5, 92.1, 94.2] },
];

const SEED_ALERTS = [
  { id: 'alt-1', title: 'Tier-1 Supplier Failure', description: 'Logistics hub reports a critical outage affecting delivery timelines for main hardware components.', severity: 'critical', domain: 'logistics', status: 'new', created_date: new Date(Date.now() - 3600000).toISOString() },
  { id: 'alt-2', title: 'Casing Line Anomaly Detected', description: 'Thermal sensors report critical asset temperature exceeded threshold on Line B.', severity: 'critical', domain: 'manufacturing', status: 'new', created_date: new Date(Date.now() - 7200000).toISOString() },
  { id: 'alt-3', title: 'Inventory Run-Out Warning', description: 'Raw material stock levels for silicon casing drop below 10% safety buffer.', severity: 'warning', domain: 'logistics', status: 'new', created_date: new Date(Date.now() - 14400000).toISOString() },
  { id: 'alt-4', title: 'Order Backlog Surge', description: 'High demand spike in APAC region is outpacing local logistics fulfillment capabilities.', severity: 'warning', domain: 'retail', status: 'new', created_date: new Date(Date.now() - 86400000).toISOString() },
];

const SEED_RECOMMENDATIONS = [
  { id: 'rec-1', title: 'Re-route APAC Shipments', description: 'Leverage backup distribution channels via Tokyo port to resolve local backlog bottlenecks.', priority: 'critical', status: 'pending', domain: 'logistics', cost_savings: 120000, confidence: 94, feasibility: 'high', created_date: new Date(Date.now() - 1800000).toISOString() },
  { id: 'rec-2', title: 'Line B Coolant Adjustment', description: 'Activate backup coolant pump B-2 and decrease casing feed rate by 5% to normalize sensor temp.', priority: 'high', status: 'pending', domain: 'manufacturing', cost_savings: 45000, confidence: 88, feasibility: 'medium', created_date: new Date(Date.now() - 3600000).toISOString() },
  { id: 'rec-3', title: 'Split-Sourcing SCM Strategy', description: 'Transition 30% of critical supply allocation to nearshore vendor to avoid Tier-1 supplier failure.', priority: 'medium', status: 'pending', domain: 'logistics', cost_savings: 280000, confidence: 81, feasibility: 'high', created_date: new Date(Date.now() - 10800000).toISOString() },
];

const SEED_AGENT_LOGS = [
  { id: 'log-1', agent_type: 'detection', action: 'Scanned thermal telemetry for Casing Line B', status: 'completed', output_summary: 'Alert triggered: Critical asset temperature exceeded 90°C', created_date: new Date(Date.now() - 7200000).toISOString() },
  { id: 'log-2', agent_type: 'diagnosis', action: 'Root cause analysis on Line B anomaly', status: 'completed', output_summary: 'Causal link found: Coolant degradation (confidence 88%)', created_date: new Date(Date.now() - 7000000).toISOString() },
  { id: 'log-3', agent_type: 'recommendation', action: 'Generated recommendations for Line B and SCM bottleneck', status: 'completed', output_summary: 'Created 2 new action blueprints', created_date: new Date(Date.now() - 3600000).toISOString() },
];

const SEED_DATA_SOURCES = [
  { id: 'ds-1', name: 'Enterprise Resource Planning (ERP)', type: 'erp', provider: 'SAP', domain: 'manufacturing', sync_frequency: 'daily', status: 'connected', records_synced: 1420500, last_sync: new Date(Date.now() - 18000000).toISOString() },
  { id: 'ds-2', name: 'Warehouse IoT Hub', type: 'iot', provider: 'Azure IoT', domain: 'logistics', sync_frequency: 'realtime', status: 'connected', records_synced: 8492000, last_sync: new Date(Date.now() - 60000).toISOString() },
  { id: 'ds-3', name: 'Global Sales CRM', type: 'crm', provider: 'Salesforce', domain: 'retail', sync_frequency: 'hourly', status: 'connected', records_synced: 320900, last_sync: new Date(Date.now() - 3600000).toISOString() },
];

const SEED_SCENARIOS = [
  { id: 'sce-1', name: 'Nearshore 30% of Sourcing', description: 'Transition supply lines nearshore to resolve Tier-1 delivery disruptions.', domain: 'logistics', status: 'completed', results: 'Central Prediction: SCM lead times reduce by 27 days on average. Capital expenditures increase by $1.2M but long-term supply chain reliability is preserved.', best_case: 'SCM lead times reduce by 35 days, raw material cost variance decreases.', worst_case: 'Lead times remain unchanged due to transitional friction; initial CapEx runs 20% over budget.', confidence: 85, variables: [{ name: 'Nearshore %', current_value: 0, simulated_value: 30, unit: '%' }], created_date: new Date(Date.now() - 86400000).toISOString() },
];

const SEED_SEMANTIC_LAYERS = [
  { id: 'sl-1', name: 'Supply Chain master metrics', type: 'cube', schema: 'logistics_cube', status: 'ready', created_date: new Date(Date.now() - 86400000).toISOString() },
  { id: 'sl-2', name: 'Asset Performance Telemetry', type: 'cube', schema: 'manufacturing_telemetry', status: 'ready', created_date: new Date(Date.now() - 172800000).toISOString() },
];

class MockEntity {
  constructor(name, defaultData = []) {
    this.name = name;
    this.storageKey = `mock_db_${name.toLowerCase()}`;
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
    }
  }

  getData() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || [];
    } catch {
      return [];
    }
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  async list(sortStr = '', limit = 100) {
    let data = this.getData();
    if (sortStr) {
      const isDesc = sortStr.startsWith('-');
      const field = isDesc ? sortStr.substring(1) : sortStr;
      data.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') {
          return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
        }
        return isDesc ? valB - valA : valA - valB;
      });
    }
    return data.slice(0, limit);
  }

  async filter(query = {}) {
    const data = this.getData();
    return data.filter(item => {
      for (const key in query) {
        if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    });
  }

  async get(id) {
    const data = this.getData();
    const found = data.find(item => item.id === id);
    if (!found) {
      throw new Error(`Object with id ${id} not found`);
    }
    return found;
  }

  async create(dataObj) {
    const data = this.getData();
    const newItem = {
      id: `${this.name.toLowerCase().substring(0, 3)}-${Math.random().toString(36).substr(2, 9)}`,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      ...dataObj
    };
    data.unshift(newItem);
    this.saveData(data);
    return newItem;
  }

  async update(id, updateData) {
    const data = this.getData();
    const idx = data.findIndex(item => item.id === id);
    if (idx === -1) {
      throw new Error(`Object with id ${id} not found`);
    }
    data[idx] = {
      ...data[idx],
      ...updateData,
      updated_date: new Date().toISOString()
    };
    this.saveData(data);
    return data[idx];
  }

  async delete(id) {
    const data = this.getData();
    const filtered = data.filter(item => item.id !== id);
    this.saveData(filtered);
    return { success: true };
  }
}

// Authentication management
const getLoggedUser = () => {
  try {
    return JSON.parse(localStorage.getItem('nexus_user'));
  } catch {
    return null;
  }
};

export const base44 = {
  auth: {
    me: async () => {
      const user = getLoggedUser();
      if (!user) throw { status: 401, message: 'Unauthenticated' };
      return user;
    },
    loginViaEmailPassword: async (email, password) => {
      const match = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (match) {
        localStorage.setItem('nexus_user', JSON.stringify(match));
        localStorage.setItem('nexus_token', 'mock-access-token');
        return match;
      }
      // If user doesn't exist, create a default user profile
      const newUser = { id: `usr-${Date.now()}`, email, name: email.split('@')[0], role: 'user' };
      localStorage.setItem('nexus_user', JSON.stringify(newUser));
      localStorage.setItem('nexus_token', 'mock-access-token');
      return newUser;
    },
    loginWithProvider: (provider, redirectUrl) => {
      // Mock Google login
      const mockGoogleUser = SEED_USERS[0]; // defaults to admin
      localStorage.setItem('nexus_user', JSON.stringify(mockGoogleUser));
      localStorage.setItem('nexus_token', 'mock-google-token');
      window.location.href = redirectUrl || '/';
    },
    register: async ({ email, password }) => {
      // Create temporary registry verification state
      localStorage.setItem('nexus_register_temp', JSON.stringify({ email }));
      return { success: true };
    },
    verifyOtp: async ({ email, otpCode }) => {
      const newUser = { id: `usr-${Date.now()}`, email, name: email.split('@')[0], role: 'user' };
      localStorage.setItem('nexus_user', JSON.stringify(newUser));
      localStorage.setItem('nexus_token', 'mock-registered-token');
      localStorage.removeItem('nexus_register_temp');
      return { access_token: 'mock-registered-token' };
    },
    resendOtp: async (email) => {
      return { success: true };
    },
    logout: (redirectUrl) => {
      localStorage.removeItem('nexus_user');
      localStorage.removeItem('nexus_token');
      if (redirectUrl) {
        window.location.href = '/login';
      }
    },
    redirectToLogin: (fromUrl) => {
      window.location.href = '/login';
    },
    setToken: (token) => {
      localStorage.setItem('nexus_token', token);
    }
  },

  entities: {
    User: new MockEntity('User', SEED_USERS),
    KPI: new MockEntity('KPI', SEED_KPIS),
    Alert: new MockEntity('Alert', SEED_ALERTS),
    Recommendation: new MockEntity('Recommendation', SEED_RECOMMENDATIONS),
    AgentLog: new MockEntity('AgentLog', SEED_AGENT_LOGS),
    DataSource: new MockEntity('DataSource', SEED_DATA_SOURCES),
    Scenario: new MockEntity('Scenario', SEED_SCENARIOS),
    SemanticLayer: new MockEntity('SemanticLayer', SEED_SEMANTIC_LAYERS),
  },

  integrations: {
    Core: {
      InvokeLLM: async ({ prompt, response_json_schema }) => {
        // Mock simulation generation based on prompt contents
        await new Promise(r => setTimeout(r, 2000));
        let results = "Simulation Complete: Variable updates applied successfully. Central prediction shows steady state normalization over 12 months.";
        if (prompt.includes('APAC')) {
          results = "APAC Expansion: Revenue is predicted to reach $18M in year 2. Best-case scenario pushes margins to 24% due to local partnership synergies. Worst-case scenario delays break-even to 22 months due to import logistics friction.";
        } else if (prompt.includes('Supplier')) {
          results = "SCM Nearshoring: Safety stock normalization achieved in 6 weeks. Reduces lead-time variance by 40% but increases immediate unit manufacturing cost by $3.20.";
        }
        return {
          results,
          best_case: "Highly optimized asset coordination leads to accelerated synergy targets.",
          worst_case: "Macroeconomic headwinds reduce estimated volume expansion by 10%.",
          confidence: 88
        };
      }
    }
  }
};

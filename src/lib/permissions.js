/**
 * Central permissions & role configuration for NexusOS.
 * Every role maps to the nav paths it can access.
 * The Sidebar, route guards, and AdminPortal all consume this file.
 */

export const ROLES = {
  admin:    { label: 'Admin',    color: 'bg-amber-400/20 text-amber-300 border-amber-400/30',   description: 'Full access to all modules, user management, and system configuration.' },
  analyst:  { label: 'Analyst',  color: 'bg-violet-400/20 text-violet-300 border-violet-400/30', description: 'Read-only intelligence, alerts, recommendations, and scenarios. No admin/data/agents.' },
  operator: { label: 'Operator', color: 'bg-blue-400/20 text-blue-300 border-blue-400/30',       description: 'Operational modules: Command Center, Alerts, Recommendations, Data Fabric.' },
  viewer:   { label: 'Viewer',   color: 'bg-slate-400/20 text-slate-300 border-slate-400/30',    description: 'Read-only access to Command Center and Intelligence Feed only.' },
  user:     { label: 'User',     color: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30', description: 'Standard access: Command Center, Intelligence, Alerts, Recommendations, and Simulation Lab.' },
};

// Maps each role to the route paths it is allowed to visit
export const ROLE_ROUTES = {
  admin:    ['/', '/intelligence', '/alerts', '/recommendations', '/scenarios', '/agents', '/data-sources', '/settings', '/admin'],
  analyst:  ['/', '/intelligence', '/alerts', '/recommendations', '/scenarios'],
  operator: ['/', '/alerts', '/recommendations', '/data-sources'],
  viewer:   ['/', '/intelligence'],
  user:     ['/', '/intelligence', '/alerts', '/recommendations', '/scenarios'],
};

// Human-readable module labels that match routes
export const ROUTE_LABELS = {
  '/':              'Command Center',
  '/intelligence':  'Intelligence Feed',
  '/alerts':        'Alerts',
  '/recommendations': 'Recommendations',
  '/scenarios':     'Simulation Lab',
  '/agents':        'AI Agents',
  '/data-sources':  'Data Fabric',
  '/settings':      'Settings',
  '/admin':         'Admin Portal',
};

/**
 * Returns true if the given role can access the given path.
 */
export function canAccess(role, path) {
  const allowed = ROLE_ROUTES[role] || ROLE_ROUTES.user;
  return allowed.includes(path);
}
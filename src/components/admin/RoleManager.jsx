import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, Minus, Plus, Pencil, Trash2, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ALL_ROUTES = ['/', '/intelligence', '/alerts', '/recommendations', '/scenarios', '/agents', '/data-sources', '/settings', '/admin'];
const ROUTE_LABELS = {
  '/': 'Command Center', '/intelligence': 'Intelligence Feed', '/alerts': 'Alerts',
  '/recommendations': 'Recommendations', '/scenarios': 'Simulation Lab',
  '/agents': 'AI Agents', '/data-sources': 'Data Fabric', '/settings': 'Settings', '/admin': 'Admin Portal',
};

const DOMAIN_OPTIONS = ['manufacturing', 'logistics', 'retail', 'finance', 'hr', 'operations'];

const DEFAULT_CUSTOM_ROLES = [];

export default function RoleManager({ builtinRoles }) {
  const [customRoles, setCustomRoles] = useState(DEFAULT_CUSTOM_ROLES);
  const [showCreate, setShowCreate] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [form, setForm] = useState({ name: '', label: '', description: '', routes: [], domains: [] });

  const openCreate = () => {
    setForm({ name: '', label: '', description: '', routes: [], domains: [] });
    setEditRole(null);
    setShowCreate(true);
  };

  const openEdit = (role) => {
    setForm({ ...role });
    setEditRole(role.name);
    setShowCreate(true);
  };

  const toggleRoute = (r) => {
    setForm(f => ({ ...f, routes: f.routes.includes(r) ? f.routes.filter(x => x !== r) : [...f.routes, r] }));
  };

  const toggleDomain = (d) => {
    setForm(f => ({ ...f, domains: f.domains.includes(d) ? f.domains.filter(x => x !== d) : [...f.domains, d] }));
  };

  const saveRole = () => {
    if (!form.name || !form.label) { toast.error('Name and label are required'); return; }
    if (editRole) {
      setCustomRoles(prev => prev.map(r => r.name === editRole ? { ...form } : r));
      toast.success('Role updated');
    } else {
      if (customRoles.find(r => r.name === form.name)) { toast.error('Role name already exists'); return; }
      setCustomRoles(prev => [...prev, { ...form }]);
      toast.success('Role created');
    }
    setShowCreate(false);
  };

  const deleteRole = (name) => {
    setCustomRoles(prev => prev.filter(r => r.name !== name));
    toast.success('Role deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Role Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Define custom roles with specific module access and domain permissions</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> Create Role</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editRole ? 'Edit Role' : 'Create Custom Role'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Role Key (no spaces)</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase().replace(/\s/g, '_') }))}
                    placeholder="e.g., regional_manager" className="mt-1 text-xs" disabled={!!editRole} />
                </div>
                <div>
                  <Label className="text-xs">Display Label</Label>
                  <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="e.g., Regional Manager" className="mt-1 text-xs" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What this role is for..." className="mt-1 text-xs" />
              </div>
              <div>
                <Label className="text-xs mb-2 block">Module Access</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_ROUTES.map(r => (
                    <button key={r} onClick={() => toggleRoute(r)}
                      className={cn("flex items-center gap-2 p-2 rounded-lg border text-xs transition-colors",
                        form.routes.includes(r) ? 'bg-primary/10 border-primary/40 text-foreground' : 'border-border/40 text-muted-foreground hover:border-border')}>
                      {form.routes.includes(r) ? <Check className="w-3 h-3 text-primary flex-shrink-0" /> : <Minus className="w-3 h-3 flex-shrink-0" />}
                      {ROUTE_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs mb-2 block">Domain Access</Label>
                <div className="flex flex-wrap gap-2">
                  {DOMAIN_OPTIONS.map(d => (
                    <button key={d} onClick={() => toggleDomain(d)}
                      className={cn("px-3 py-1 rounded-full border text-xs capitalize transition-colors",
                        form.domains.includes(d) ? 'bg-primary/10 border-primary/40 text-foreground' : 'border-border/40 text-muted-foreground hover:border-border')}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={saveRole} className="w-full">{editRole ? 'Save Changes' : 'Create Role'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Built-in roles */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Built-in System Roles</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(builtinRoles).map(([key, cfg], i) => (
            <motion.div key={key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-4 rounded-xl border border-border/50 bg-card">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                <Badge variant="outline" className={cn("text-[10px]", cfg.color)}>{cfg.label}</Badge>
                <Badge variant="outline" className="text-[10px] ml-auto">system</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{cfg.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom roles */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Custom Roles {customRoles.length > 0 && `(${customRoles.length})`}</p>
        {customRoles.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border/50 rounded-xl text-muted-foreground">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No custom roles yet</p>
            <p className="text-xs mt-1">Click "Create Role" to define a new role with custom permissions</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customRoles.map((role, i) => (
              <motion.div key={role.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="p-4 rounded-xl border border-border/50 bg-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{role.label}</p>
                      <Badge variant="outline" className="text-[10px]">{role.name}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{role.description || '—'}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {role.routes.map(r => <Badge key={r} variant="outline" className="text-[9px]">{ROUTE_LABELS[r]}</Badge>)}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(role)}><Pencil className="w-3 h-3" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteRole(role.name)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Building2, Users, Pencil, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ROLES } from '@/lib/permissions';

const WORKSPACE_TYPES = ['Enterprise', 'Department', 'Team', 'Project'];

export default function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState([
    { id: 'ws-default', name: 'Default Workspace', type: 'Enterprise', description: 'Main organizational workspace', members: [], status: 'active' }
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Department', description: '', defaultRole: 'user' });
  const [showAssign, setShowAssign] = useState(null); // workspace id
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState('user');

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const openCreate = () => {
    setForm({ name: '', type: 'Department', description: '', defaultRole: 'user' });
    setEditId(null);
    setShowCreate(true);
  };

  const openEdit = (ws) => {
    setForm({ name: ws.name, type: ws.type, description: ws.description, defaultRole: ws.defaultRole || 'user' });
    setEditId(ws.id);
    setShowCreate(true);
  };

  const saveWorkspace = () => {
    if (!form.name) { toast.error('Workspace name required'); return; }
    if (editId) {
      setWorkspaces(prev => prev.map(ws => ws.id === editId ? { ...ws, ...form } : ws));
      toast.success('Workspace updated');
    } else {
      const id = 'ws-' + Date.now();
      setWorkspaces(prev => [...prev, { id, ...form, members: [], status: 'active' }]);
      toast.success('Workspace created');
    }
    setShowCreate(false);
  };

  const deleteWorkspace = (id) => {
    if (id === 'ws-default') { toast.error('Cannot delete default workspace'); return; }
    setWorkspaces(prev => prev.filter(ws => ws.id !== id));
    toast.success('Workspace deleted');
  };

  const assignMember = (wsId) => {
    if (!assignUserId) { toast.error('Select a user'); return; }
    setWorkspaces(prev => prev.map(ws => {
      if (ws.id !== wsId) return ws;
      const already = ws.members.find(m => m.userId === assignUserId);
      if (already) { toast.error('User already in this workspace'); return ws; }
      return { ...ws, members: [...ws.members, { userId: assignUserId, role: assignRole }] };
    }));
    toast.success('User added to workspace');
    setAssignUserId('');
    setAssignRole('user');
    setShowAssign(null);
  };

  const removeMember = (wsId, userId) => {
    setWorkspaces(prev => prev.map(ws =>
      ws.id !== wsId ? ws : { ...ws, members: ws.members.filter(m => m.userId !== userId) }
    ));
  };

  const getUserName = (id) => users.find(u => u.id === id)?.full_name || users.find(u => u.id === id)?.email || id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Workspace Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Create and manage workspaces — assign users and default roles per workspace</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2" onClick={openCreate}><Plus className="w-4 h-4" /> New Workspace</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit Workspace' : 'Create Workspace'}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">Workspace Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Finance Team" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {WORKSPACE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Default Role for Members</Label>
                  <Select value={form.defaultRole} onValueChange={v => setForm(f => ({ ...f, defaultRole: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLES).map(([r, c]) => <SelectItem key={r} value={r}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Purpose of this workspace..." className="mt-1" />
              </div>
              <Button onClick={saveWorkspace} className="w-full">{editId ? 'Save Changes' : 'Create Workspace'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {workspaces.map((ws, i) => (
          <motion.div key={ws.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-semibold">{ws.name}</h3>
                  <Badge variant="outline" className="text-[10px]">{ws.type}</Badge>
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-400/30">{ws.status}</Badge>
                  {ws.id === 'ws-default' && <Badge className="text-[10px] bg-amber-400/20 text-amber-300 border-amber-400/30">Default</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{ws.description || '—'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" /> {ws.members.length} member{ws.members.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs text-muted-foreground">Default role: <span className="text-foreground">{ROLES[ws.defaultRole || 'user']?.label}</span></span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setShowAssign(showAssign === ws.id ? null : ws.id); setAssignUserId(''); }}>
                  <Plus className="w-3 h-3" /> Add User
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(ws)}><Pencil className="w-3 h-3" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => deleteWorkspace(ws.id)}><Trash2 className="w-3 h-3 text-destructive" /></Button>
              </div>
            </div>

            {/* Add user panel */}
            {showAssign === ws.id && (
              <div className="px-5 pb-4 border-t border-border/30 pt-4 bg-secondary/10">
                <p className="text-xs font-medium mb-3">Add user to {ws.name}</p>
                <div className="flex gap-2">
                  <Select value={assignUserId} onValueChange={setAssignUserId}>
                    <SelectTrigger className="flex-1 h-8 text-xs"><SelectValue placeholder="Select user..." /></SelectTrigger>
                    <SelectContent>
                      {users.map(u => <SelectItem key={u.id} value={u.id}><span className="flex items-center gap-2"><User className="w-3 h-3" />{u.full_name || u.email}</span></SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={assignRole} onValueChange={setAssignRole}>
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ROLES).map(([r, c]) => <SelectItem key={r} value={r}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-8 text-xs" onClick={() => assignMember(ws.id)}>Add</Button>
                </div>
              </div>
            )}

            {/* Members */}
            {ws.members.length > 0 && (
              <div className="border-t border-border/30">
                <div className="divide-y divide-border/20">
                  {ws.members.map(m => (
                    <div key={m.userId} className="px-5 py-2.5 flex items-center gap-3 hover:bg-secondary/10">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground">
                        {(getUserName(m.userId))[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{getUserName(m.userId)}</p>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px]", ROLES[m.role]?.color)}>{ROLES[m.role]?.label || m.role}</Badge>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeMember(ws.id, m.userId)}>
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
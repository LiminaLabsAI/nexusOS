import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, Users, UserPlus, Mail, Crown, User, 
  Loader2, CheckCircle, AlertTriangle, Settings, Database,
  Activity, BarChart3, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

const roleConfig = {
  admin: { label: 'Admin', icon: Crown, color: 'bg-amber-400/20 text-amber-300 border-amber-400/30', desc: 'Full access to all features, user management, and system configuration' },
  user: { label: 'User', icon: User, color: 'bg-blue-400/20 text-blue-300 border-blue-400/30', desc: 'Access to Command Center, Alerts, Recommendations, and Scenarios' },
};

const PERMISSIONS = {
  admin: ['Command Center', 'Intelligence Feed', 'Alerts', 'Recommendations', 'Simulation Lab', 'AI Agents', 'Data Fabric', 'Settings', 'Admin Portal', 'User Management', 'System Config'],
  user: ['Command Center', 'Intelligence Feed', 'Alerts', 'Recommendations', 'Simulation Lab'],
};

export default function AdminPortal() {
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
    initialData: [],
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated');
    },
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInvite(false);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err) {
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  // Guard: only admins can access
  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.filter(u => u.role !== 'admin').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">User management and role-based access control</p>
          </div>
        </div>
        <Dialog open={showInvite} onOpenChange={setShowInvite}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" /> Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label className="text-xs">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="pl-10"
                    type="email"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" /> User — Standard access
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-400" /> Admin — Full access
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Permissions preview */}
              <div className="p-3 bg-secondary/30 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Permissions granted to <span className="capitalize">{inviteRole}</span>:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PERMISSIONS[inviteRole]?.map((perm) => (
                    <Badge key={perm} variant="outline" className="text-[10px]">
                      <CheckCircle className="w-2.5 h-2.5 mr-1 text-emerald-400" />
                      {perm}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleInvite}
                disabled={!inviteEmail || inviting}
                className="w-full gap-2"
              >
                {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                {inviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-primary' },
          { label: 'Admins', value: adminCount, icon: Crown, color: 'text-amber-400' },
          { label: 'Standard Users', value: userCount, icon: User, color: 'text-blue-400' },
          { label: 'Active Sessions', value: users.length, icon: Activity, color: 'text-emerald-400' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border/50 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={cn("w-4 h-4", stat.color)} />
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
            <p className={cn("text-2xl font-bold font-display", stat.color)}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Role Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => (
          <div key={role} className="bg-card rounded-xl border border-border/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", role === 'admin' ? 'bg-amber-400/10' : 'bg-blue-400/10')}>
                <config.icon className={cn("w-4 h-4", role === 'admin' ? 'text-amber-400' : 'text-blue-400')} />
              </div>
              <div>
                <Badge variant="outline" className={cn("text-xs", config.color)}>{config.label}</Badge>
                <p className="text-xs text-muted-foreground mt-1">{config.desc}</p>
              </div>
            </div>
            <Separator className="mb-3" />
            <p className="text-xs font-medium text-muted-foreground mb-2">Accessible modules:</p>
            <div className="flex flex-wrap gap-1.5">
              {PERMISSIONS[role].map(perm => (
                <Badge key={perm} variant="outline" className="text-[10px]">{perm}</Badge>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Users className="w-4 h-4" /> Team Members
          </h3>
          <Badge variant="outline" className="text-xs">{users.length} total</Badge>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading users...</p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {users.map((u, i) => {
              const role = u.role || 'user';
              const config = roleConfig[role] || roleConfig.user;
              const RoleIcon = config.icon;
              const isCurrentUser = u.id === user?.id;

              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 px-5 flex items-center gap-4 hover:bg-secondary/20 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{u.full_name || 'No name set'}</p>
                      {isCurrentUser && <Badge variant="outline" className="text-[10px]">You</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    {u.created_date && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Joined {format(new Date(u.created_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant="outline" className={cn("text-xs gap-1", config.color)}>
                      <RoleIcon className="w-3 h-3" />
                      {config.label}
                    </Badge>
                    {!isCurrentUser && (
                      <Select
                        value={role}
                        onValueChange={(newRole) => updateUserMutation.mutate({ id: u.id, data: { role: newRole } })}
                      >
                        <SelectTrigger className="h-7 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> User</span>
                          </SelectItem>
                          <SelectItem value="admin">
                            <span className="flex items-center gap-1.5"><Crown className="w-3 h-3 text-amber-400" /> Admin</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {isCurrentUser && (
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Lock className="w-3 h-3" /> Cannot change own role
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {users.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
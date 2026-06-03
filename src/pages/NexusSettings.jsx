import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Bell, Shield, Palette, Users, Save, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function NexusSettings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    warningAlerts: true,
    recommendations: true,
    agentActivity: false,
    dailyDigest: true,
  });

  const [autonomy, setAutonomy] = useState({
    autoDetection: true,
    autoRecommendation: true,
    autoExecution: false,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your NexusOS experience</p>
      </div>

      {/* Profile */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" /> Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Name</Label>
              <Input value={user?.full_name || ''} readOnly className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input value={user?.email || ''} readOnly className="mt-1" />
            </div>
          </div>
          <div>
            <Label className="text-xs">Role</Label>
            <Input value={user?.role || 'user'} readOnly className="mt-1 w-48" />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" /> Notifications
          </CardTitle>
          <CardDescription className="text-xs">Choose what alerts and updates you receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
              <Switch checked={value} onCheckedChange={(v) => setNotifications({ ...notifications, [key]: v })} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* AI Autonomy */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4" /> AI Autonomy Level
          </CardTitle>
          <CardDescription className="text-xs">Control how much autonomy AI agents have</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Automatic Detection</Label>
              <p className="text-xs text-muted-foreground">Allow AI to automatically detect anomalies</p>
            </div>
            <Switch checked={autonomy.autoDetection} onCheckedChange={(v) => setAutonomy({ ...autonomy, autoDetection: v })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Automatic Recommendations</Label>
              <p className="text-xs text-muted-foreground">Allow AI to generate recommendations without prompt</p>
            </div>
            <Switch checked={autonomy.autoRecommendation} onCheckedChange={(v) => setAutonomy({ ...autonomy, autoRecommendation: v })} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Semi-Autonomous Execution</Label>
              <p className="text-xs text-muted-foreground text-amber-400">Allow AI to execute approved low-risk actions automatically</p>
            </div>
            <Switch checked={autonomy.autoExecution} onCheckedChange={(v) => setAutonomy({ ...autonomy, autoExecution: v })} />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="gap-2" onClick={() => toast.success('Settings saved')}>
          <Save className="w-4 h-4" /> Save Settings
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => base44.auth.logout()}>
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
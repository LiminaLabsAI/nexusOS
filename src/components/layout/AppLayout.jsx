import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Footer from './Footer';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [persona, setPersona] = useState('coo');

  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts-count'],
    queryFn: () => base44.entities.Alert.filter({ status: 'new' }),
    initialData: [],
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className="transition-all duration-300"
        style={{ marginLeft: collapsed ? 72 : 260 }}
      >
        <TopBar
          persona={persona}
          onPersonaChange={setPersona}
          alertCount={alerts.length}
        />
        <main className="p-6">
          <Outlet context={{ persona }} />
        </main>
        <Footer />
      </div>
    </div>
  );
}
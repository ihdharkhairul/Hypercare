import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ role, active, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex">
      <Sidebar role={role} active={active} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 min-w-0">
        <Topbar onBurger={() => setSidebarOpen(p => !p)} />
        {children}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import Sidebar from "../../Components/Admin/sidebar";
import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // close the mobile drawer after navigating
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 min-w-0 p-4 sm:p-6 bg-gray-100 min-h-screen">
        {/* mobile top bar with the drawer toggle */}
        <div className="md:hidden -mx-4 -mt-4 mb-4 px-4 py-3 bg-gray-900 text-white flex items-center gap-3 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-800"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold">Dashboard</span>
        </div>
        <Outlet /> {/* Yaha page content load hoga */}
      </main>
    </div>
  );
}

export default DashboardLayout;

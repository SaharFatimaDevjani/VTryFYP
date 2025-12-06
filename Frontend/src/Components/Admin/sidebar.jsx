// src/components/Sidebar.js
import React from "react";
import { navItems } from "../../config/navitem"; // aapka navItems array
import { Link } from "react-router-dom";
import { Home, Users, Settings, User, XSquare, ChartPie, Plug } from "lucide-react";

const iconMap = {
  "chart-pie": ChartPie,
  "users": Users,
  "gear-six": Settings,
  "user": User,
  "x-square": XSquare,
  "plugs-connected": Plug,
};

function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white p-4 min-h-screen">
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || Home;
          return (
            <Link
              key={item.key}
              to={item.href}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700"
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;

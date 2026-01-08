import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { navItems } from "../../config/navitem";
import {
  Home,
  Users,
  Settings,
  User,
  XSquare,
  ChartPie,
  Plug,
  LogOut,
} from "lucide-react";

const iconMap = {
  "chart-pie": ChartPie,
  users: Users,
  "gear-six": Settings,
  user: User,
  "x-square": XSquare,
  "plugs-connected": Plug,
};

function Sidebar() {
  const navigate = useNavigate();

  const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside
      className="
        w-64 shrink-0
        bg-gray-900 text-white
        p-4
        h-screen
        sticky top-0
        flex flex-col
      "
    >
      <div className="mb-6">
        <h1 className="text-xl font-bold">Dashboard</h1>

        <div className="mt-3 text-sm text-gray-300">
          <div className="font-semibold text-white">
            {user?.first_name
              ? `${user.first_name} ${user.last_name || ""}`
              : "Admin"}
          </div>
          <div className="text-xs text-gray-400">{user?.email || ""}</div>
        </div>
      </div>

      <nav className="space-y-2 flex-1 overflow-auto pr-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || Home;
          return (
            <NavLink
              key={item.key}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded-lg transition ${
                  isActive ? "bg-gray-700" : "hover:bg-gray-800"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-6 flex items-center gap-2 p-2 rounded-lg bg-red-600 hover:bg-red-700 transition"
      >
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;

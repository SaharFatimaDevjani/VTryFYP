// Frontend/src/config/navitem.js
export const navItems = [
  { key: "overview", title: "Overview", href: "/admin", icon: "chart-pie" },
  { key: "products", title: "Products", href: "/admin/products", icon: "plugs-connected" },
  { key: "users", title: "Users", href: "/admin/users", icon: "users" },
  { key: "orders", title: "Orders", href: "/admin/orders", icon: "x-square" }, // only if you have this route
  { key: "settings", title: "Settings", href: "/admin/settings", icon: "gear-six" }, // only if you have this route
];

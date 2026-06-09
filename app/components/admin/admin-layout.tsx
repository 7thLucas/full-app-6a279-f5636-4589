import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Calendar,
  Layers,
  Users,
  Settings,
  Bell,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "~/modules/authentication/use-authentication";
import { useConfigurables } from "~/modules/configurables";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Puzzle Tracker", href: "/admin/puzzles", icon: Layers },
  { label: "Schedule", href: "/admin/schedule", icon: Users },
  { label: "Rooms", href: "/admin/rooms", icon: Building2 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={[
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-indigo-600 text-white shadow-md"
          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800",
        collapsed ? "justify-center px-2" : "",
      ].join(" ")}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const { config } = useConfigurables();

  const appName = config?.appName ?? "EscapeOps";

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed lg:relative inset-y-0 left-0 z-30 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200",
          sidebarCollapsed ? "w-16" : "w-60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800 shrink-0">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2 min-w-0">
              {config?.logoUrl && config.logoUrl !== "FILL_LOGO_URL_HERE" ? (
                <img src={config.logoUrl} alt={appName} className="h-7 w-7 rounded-md object-cover shrink-0" />
              ) : (
                <div className="h-7 w-7 rounded-md bg-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">EO</span>
                </div>
              )}
              <span className="font-bold text-sm text-white truncate">{appName}</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="h-7 w-7 rounded-md bg-indigo-600 flex items-center justify-center mx-auto">
              <span className="text-white text-xs font-bold">EO</span>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex items-center justify-center h-6 w-6 rounded text-slate-500 hover:text-slate-300 shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex lg:hidden items-center justify-center h-6 w-6 rounded text-slate-500 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-slate-800 shrink-0">
          {!sidebarCollapsed && user && (
            <div className="flex items-center gap-2 px-2 py-1 mb-2">
              <div className="h-7 w-7 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {user.username?.[0]?.toUpperCase() ?? "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{user.username}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <Link
            to="/auth/logout"
            method="post"
            className={[
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors",
              sidebarCollapsed ? "justify-center" : "",
            ].join(" ")}
            title={sidebarCollapsed ? "Sign out" : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && "Sign out"}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-4 lg:px-6 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex lg:hidden items-center justify-center h-8 w-8 rounded text-slate-400 hover:text-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            {title && (
              <h1 className="text-sm font-semibold text-slate-100">{title}</h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
              <Bell className="h-4 w-4" />
            </button>
            {user && (
              <div className="h-8 w-8 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-semibold text-white">
                {user.username?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

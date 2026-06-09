import { Link } from "react-router";
import {
  Calendar,
  Layers,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useTodayStats } from "~/escapeops/bookings/hooks/use-bookings";
import { usePuzzleAlerts } from "~/escapeops/puzzles/hooks/use-puzzles";
import { useTodayOnDuty } from "~/escapeops/schedule/hooks/use-shifts";
import { useConfigurables } from "~/modules/configurables";

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "indigo",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: "indigo" | "emerald" | "amber" | "rose";
}) {
  const colorMap = {
    indigo: "text-indigo-400 bg-indigo-400/10",
    emerald: "text-emerald-400 bg-emerald-400/10",
    amber: "text-amber-400 bg-amber-400/10",
    rose: "text-rose-400 bg-rose-400/10",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-100">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function FillRateBar({ rate }: { rate: number }) {
  const color = rate >= 80 ? "bg-emerald-500" : rate >= 50 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-300 w-10 text-right">{rate}%</span>
    </div>
  );
}

function FreshnessBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
    </div>
  );
}

export function DashboardOverview() {
  const { stats, loading: statsLoading } = useTodayStats();
  const { alerts, loading: alertsLoading } = usePuzzleAlerts();
  const { staff, loading: staffLoading } = useTodayOnDuty();
  const { config } = useConfigurables();

  const fillRate = stats ? Math.round((stats.confirmed / Math.max(stats.total, 1)) * 100) : 0;
  const roomFillRate = stats ? Math.round((stats.roomsInUse / Math.max(stats.totalRooms, 1)) * 100) : 0;

  const welcomeMessage = config?.dashboardWelcomeMessage ?? "Welcome back. Here's your ops overview.";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Operations Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">{welcomeMessage}</p>
      </div>

      {/* Maintenance alert banner */}
      {!alertsLoading && alerts.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-300">
              {alerts.length} puzzle{alerts.length !== 1 ? "s" : ""} need attention
            </p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              {alerts.filter((a) => a.needsRefresh).length} overdue for refresh,{" "}
              {alerts.filter((a) => a.status === "under_repair").length} under repair
            </p>
          </div>
          <Link
            to="/admin/puzzles"
            className="text-xs text-amber-300 hover:text-amber-100 flex items-center gap-1 shrink-0 ml-auto"
          >
            View <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Bookings"
          value={statsLoading ? "—" : stats?.total ?? 0}
          sub={`${stats?.confirmed ?? 0} confirmed`}
          icon={Calendar}
          color="indigo"
        />
        <StatCard
          label="Fill Rate"
          value={statsLoading ? "—" : `${fillRate}%`}
          sub="of today's bookings confirmed"
          icon={TrendingUp}
          color={fillRate >= 80 ? "emerald" : fillRate >= 50 ? "amber" : "rose"}
        />
        <StatCard
          label="Rooms in Use"
          value={statsLoading ? "—" : `${stats?.roomsInUse ?? 0} / ${stats?.totalRooms ?? 0}`}
          sub={`${roomFillRate}% utilization today`}
          icon={Building2}
          color="emerald"
        />
        <StatCard
          label="Maintenance Alerts"
          value={alertsLoading ? "—" : alerts.length}
          sub={alerts.length === 0 ? "All puzzles healthy" : "Puzzles need attention"}
          icon={AlertTriangle}
          color={alerts.length > 0 ? "amber" : "emerald"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's booking overview */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Today's Booking Summary</h2>
            <Link to="/admin/bookings" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {statsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-slate-300">Confirmed</span>
                </div>
                <span className="text-sm font-semibold text-slate-100">{stats?.confirmed ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-slate-300">Pending</span>
                </div>
                <span className="text-sm font-semibold text-slate-100">{stats?.pending ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span className="text-sm text-slate-300">Cancelled</span>
                </div>
                <span className="text-sm font-semibold text-slate-100">{stats?.cancelled ?? 0}</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Overall fill rate today</p>
                <FillRateBar rate={fillRate} />
              </div>
            </div>
          )}
        </div>

        {/* Staff on duty */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200">Staff on Duty Today</h2>
            <Link to="/admin/schedule" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              View schedule <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {staffLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : staff.length === 0 ? (
            <p className="text-sm text-slate-500 py-4 text-center">No staff scheduled today</p>
          ) : (
            <div className="space-y-2">
              {staff.slice(0, 5).map((s) => {
                const room = typeof s.roomId === "object" && s.roomId ? s.roomId as any : null;
                return (
                  <div key={s._id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                        {s.staffName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-200 font-medium truncate">{s.staffName}</p>
                        <p className="text-xs text-slate-500 capitalize">{s.role.replace("_", " ")}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {room && (
                        <p className="text-xs text-slate-400 truncate max-w-[120px]">{room.name}</p>
                      )}
                      <p className="text-xs text-slate-500">{s.startTime} – {s.endTime}</p>
                    </div>
                  </div>
                );
              })}
              {staff.length > 5 && (
                <p className="text-xs text-slate-500 pt-1 text-center">+{staff.length - 5} more</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Maintenance alerts panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-200">Puzzle Maintenance Alerts</h2>
          <Link to="/admin/puzzles" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            Open tracker <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {alertsLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex items-center gap-2 py-4 justify-center">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <p className="text-sm text-slate-400">All puzzles are fresh and in good shape</p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.slice(0, 6).map((puzzle) => {
              const room = typeof puzzle.roomId === "object" && puzzle.roomId ? puzzle.roomId as any : null;
              const statusColor = puzzle.status === "under_repair" ? "text-amber-400" : puzzle.freshnessScore < 40 ? "text-rose-400" : "text-amber-400";
              const statusLabel = puzzle.status === "under_repair" ? "Under Repair" : "Needs Refresh";
              return (
                <div key={puzzle._id} className="flex items-center gap-4 p-3 bg-slate-800/60 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-200 truncate">{puzzle.name}</p>
                      <span className={`text-xs font-medium shrink-0 ${statusColor}`}>
                        {statusLabel}
                      </span>
                    </div>
                    {room && <p className="text-xs text-slate-500">{room.name}</p>}
                    <FreshnessBar score={puzzle.freshnessScore} />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-slate-500 mb-0.5">Freshness</p>
                    <p className={`text-sm font-semibold ${puzzle.freshnessScore < 40 ? "text-rose-400" : "text-amber-400"}`}>
                      {puzzle.freshnessScore}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Open Booking Calendar", href: "/admin/bookings", icon: Calendar, color: "indigo" },
          { label: "View Puzzle Tracker", href: "/admin/puzzles", icon: Layers, color: "amber" },
          { label: "Manage Schedule", href: "/admin/schedule", icon: Users, color: "emerald" },
        ].map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 hover:bg-slate-800/60 transition-all group"
          >
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
              item.color === "indigo" ? "bg-indigo-500/20 text-indigo-400" :
              item.color === "amber" ? "bg-amber-500/20 text-amber-400" :
              "bg-emerald-500/20 text-emerald-400"
            }`}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-slate-300 group-hover:text-slate-100">{item.label}</span>
            <ArrowRight className="h-4 w-4 text-slate-600 ml-auto group-hover:text-slate-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}

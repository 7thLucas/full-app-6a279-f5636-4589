import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { AdminLayout } from "~/components/admin/admin-layout";
import { useConfigurables } from "~/modules/configurables";
import { Settings, Bell, Users, Puzzle } from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

function SettingRow({ label, value }: { label: string; value: string | number | boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span className="text-sm font-medium text-slate-100">{String(value)}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { config, loading } = useConfigurables();

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
          <p className="text-sm text-slate-400 mt-0.5">App configuration and operational settings</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branding */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-200">Branding</h2>
              </div>
              <div className="space-y-0">
                <SettingRow label="App Name" value={config?.appName ?? "—"} />
                <SettingRow label="Tagline" value={(config as any)?.tagline ?? "—"} />
                <SettingRow label="Business Name" value={(config as any)?.businessName ?? "—"} />
                <SettingRow label="Contact Email" value={(config as any)?.contactEmail ?? "—"} />
              </div>
            </div>

            {/* Booking Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-200">Booking Settings</h2>
              </div>
              <div className="space-y-0">
                <SettingRow label="Session Duration" value={`${(config as any)?.defaultSessionDurationMinutes ?? 60} min`} />
                <SettingRow label="Slot Interval" value={`${(config as any)?.bookingSlotIntervalMinutes ?? 30} min`} />
                <SettingRow label="Max Group Size" value={(config as any)?.maxGroupSize ?? 8} />
                <SettingRow label="Waitlist Enabled" value={(config as any)?.enableWaitlist ? "Yes" : "No"} />
              </div>
            </div>

            {/* Puzzle Settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Puzzle className="h-4 w-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-slate-200">Puzzle Settings</h2>
              </div>
              <div className="space-y-0">
                <SettingRow
                  label="Freshness Alert Threshold"
                  value={`${(config as any)?.puzzleFreshnessThresholdDays ?? 30} days`}
                />
                <SettingRow label="Email Notifications" value={(config as any)?.enableEmailNotifications ? "Enabled" : "Disabled"} />
              </div>
            </div>

            {/* Brand Colors */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-200">Brand Colors</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Primary", value: config?.brandColor?.primary },
                  { label: "Secondary", value: config?.brandColor?.secondary },
                  { label: "Accent", value: config?.brandColor?.accent },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">{label}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-5 w-5 rounded-full border border-slate-700"
                        style={{ backgroundColor: value ?? "#000" }}
                      />
                      <span className="text-sm font-mono text-slate-400">{value ?? "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-sm text-slate-400">
            Settings are managed through the app configuration panel. Use the portal editor to update branding, colors, booking defaults, and puzzle thresholds.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

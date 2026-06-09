import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, X, AlertCircle, Users } from "lucide-react";
import { useWeekShifts, useShifts, type Shift, type CreateShiftPayload } from "~/escapeops/schedule/hooks/use-shifts";
import { useRooms } from "~/escapeops/rooms/hooks/use-rooms";
import { useAuth } from "~/modules/authentication/use-authentication";

const ROLE_CONFIG = {
  owner: { label: "Owner", color: "bg-indigo-600 text-white" },
  manager: { label: "Manager", color: "bg-slate-600 text-slate-100" },
  game_master: { label: "Game Master", color: "bg-emerald-600 text-white" },
} as const;

const STATUS_CONFIG = {
  scheduled: { label: "Scheduled", dot: "bg-slate-400" },
  confirmed: { label: "Confirmed", dot: "bg-emerald-400" },
  cancelled: { label: "Cancelled", dot: "bg-rose-400" },
  completed: { label: "Completed", dot: "bg-indigo-400" },
} as const;

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function getWeekDays(monday: Date): { date: string; label: string; short: string }[] {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    const dateStr = formatDate(d);
    days.push({
      date: dateStr,
      label: d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      short: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
    });
  }
  return days;
}

interface AddShiftModalProps {
  rooms: any[];
  onClose: () => void;
  onCreate: (payload: CreateShiftPayload) => Promise<any>;
  defaultDate?: string;
}

function AddShiftModal({ rooms, onClose, onCreate, defaultDate }: AddShiftModalProps) {
  const [form, setForm] = useState<CreateShiftPayload>({
    staffId: "",
    staffName: "",
    role: "game_master",
    date: defaultDate ?? formatDate(new Date()),
    startTime: "10:00",
    endTime: "18:00",
    roomId: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staffName.trim()) return setError("Staff name is required");
    setLoading(true);
    // Use staffName as staffId if no ID provided
    const payload = { ...form, staffId: form.staffId || form.staffName.toLowerCase().replace(/\s+/g, "-") };
    const res = await onCreate(payload);
    setLoading(false);
    if (res.success) onClose();
    else setError(res.message ?? "Failed to create shift");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-slate-900 ring-1 ring-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">Add Shift</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 text-xs text-rose-400">{error}</div>}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Staff Name *</label>
              <input
                type="text"
                value={form.staffName}
                onChange={(e) => setForm((f) => ({ ...f, staffName: e.target.value }))}
                placeholder="Full name"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as any }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="game_master">Game Master</option>
                <option value="manager">Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Start Time</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Assigned Room</label>
            <select
              value={form.roomId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value || undefined }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">No room assigned</option>
              {rooms.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Saving..." : "Add Shift"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ShiftChip({ shift, onDelete }: { shift: Shift; onDelete: () => void }) {
  const [hovered, setHovered] = useState(false);
  const roleCfg = ROLE_CONFIG[shift.role] ?? ROLE_CONFIG.game_master;
  const room = typeof shift.roomId === "object" && shift.roomId ? shift.roomId as any : null;

  return (
    <div
      className={`relative rounded-lg p-2 text-xs ${roleCfg.color} cursor-pointer group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="font-semibold truncate">{shift.staffName}</p>
      <p className="opacity-80 truncate">{shift.startTime} – {shift.endTime}</p>
      {room && <p className="opacity-70 truncate text-[10px]">{room.name}</p>}
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center bg-black/30 rounded-full hover:bg-black/50"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </div>
  );
}

export function TeamSchedule() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOfWeek(new Date()));
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalDate, setAddModalDate] = useState<string | undefined>();
  const { rooms } = useRooms();

  const weekStartStr = formatDate(weekStart);
  const { shifts, loading, refetch } = useWeekShifts(weekStartStr);
  const { createShift, deleteShift } = useShifts();

  const weekDays = getWeekDays(weekStart);
  const isOwnerOrManager = user?.role === "admin" || true; // For demo, allow all

  // Group shifts by date + staffName
  const staffSet = new Set(shifts.map((s) => s.staffName));
  const staffList = [...staffSet].sort();

  // Unique staff per day
  const shiftsByStaffDate = new Map<string, Shift[]>();
  for (const shift of shifts) {
    const key = `${shift.staffName}::${shift.date}`;
    if (!shiftsByStaffDate.has(key)) shiftsByStaffDate.set(key, []);
    shiftsByStaffDate.get(key)!.push(shift);
  }

  const handleCreate = async (payload: CreateShiftPayload) => {
    const res = await createShift(payload);
    if (res.success) refetch();
    return res;
  };

  const handleDelete = async (id: string) => {
    await deleteShift(id);
    refetch();
  };

  // Unassigned game masters (no room) for today
  const today = formatDate(new Date());
  const unassignedToday = shifts.filter(
    (s) => s.date === today && s.role === "game_master" && !s.roomId && s.status !== "cancelled"
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Team Schedule</h1>
          <p className="text-sm text-slate-400 mt-0.5">Weekly staff shifts and room assignments</p>
        </div>
        {isOwnerOrManager && (
          <button
            onClick={() => { setAddModalDate(undefined); setShowAddModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> Add Shift
          </button>
        )}
      </div>

      {/* Conflict alert */}
      {unassignedToday.length > 0 && (
        <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <p className="text-sm text-rose-300">
            {unassignedToday.length} game master{unassignedToday.length !== 1 ? "s" : ""} today with no room assignment
          </p>
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
        <button
          onClick={() => setWeekStart(addDays(weekStart, -7))}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-slate-100">
            {weekDays[0].short} – {weekDays[6].short}
          </p>
          <p className="text-xs text-slate-500">{shifts.length} shifts this week</p>
        </div>
        <button
          onClick={() => setWeekStart(addDays(weekStart, 7))}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => setWeekStart(getMondayOfWeek(new Date()))}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 hover:text-slate-100 rounded-lg"
        >
          This Week
        </button>
      </div>

      {/* Weekly grid */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : staffList.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center">
          <Users className="h-10 w-10 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No shifts scheduled for this week</p>
          <p className="text-xs text-slate-600 mt-1">Click "Add Shift" to schedule staff</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 w-36 sticky left-0 bg-slate-900">Staff</th>
                {weekDays.map((day) => {
                  const isToday = day.date === today;
                  return (
                    <th key={day.date} className={`px-2 py-3 text-center text-xs font-medium ${isToday ? "text-indigo-400" : "text-slate-400"}`}>
                      <div>{day.short}</div>
                      {isToday && <div className="text-[10px] text-indigo-500">Today</div>}
                    </th>
                  );
                })}
                {isOwnerOrManager && <th className="px-2 py-3 w-10" />}
              </tr>
            </thead>
            <tbody>
              {staffList.map((staffName) => {
                const staffShifts = shifts.filter((s) => s.staffName === staffName);
                const firstShift = staffShifts[0];
                const roleCfg = ROLE_CONFIG[firstShift?.role ?? "game_master"] ?? ROLE_CONFIG.game_master;

                return (
                  <tr key={staffName} className="border-b border-slate-800/50">
                    <td className="px-4 py-2 sticky left-0 bg-slate-900/95">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                          {staffName[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate">{staffName}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${roleCfg.color}`}>
                            {roleCfg.label}
                          </span>
                        </div>
                      </div>
                    </td>
                    {weekDays.map((day) => {
                      const dayShifts = shiftsByStaffDate.get(`${staffName}::${day.date}`) ?? [];
                      return (
                        <td key={day.date} className="px-1.5 py-1.5 align-top">
                          <div className="space-y-1 min-h-[40px]">
                            {dayShifts.map((shift) => (
                              <ShiftChip
                                key={shift._id}
                                shift={shift}
                                onDelete={() => handleDelete(shift._id)}
                              />
                            ))}
                            {isOwnerOrManager && dayShifts.length === 0 && (
                              <button
                                onClick={() => { setAddModalDate(day.date); setShowAddModal(true); }}
                                className="w-full h-9 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-slate-700 hover:border-indigo-500/50 hover:text-indigo-500 transition-all"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    {isOwnerOrManager && <td />}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${cfg.color}`}>{cfg.label}</span>
          </div>
        ))}
      </div>

      {showAddModal && (
        <AddShiftModal
          rooms={rooms}
          defaultDate={addModalDate}
          onClose={() => setShowAddModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Check, Clock, Ban, AlertCircle } from "lucide-react";
import { useBookings, type Booking, type CreateBookingPayload } from "~/escapeops/bookings/hooks/use-bookings";
import { useRooms, type Room } from "~/escapeops/rooms/hooks/use-rooms";

const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: "bg-emerald-600 text-white", dot: "bg-emerald-400" },
  pending: { label: "Pending", color: "bg-amber-600 text-white", dot: "bg-amber-400" },
  cancelled: { label: "Cancelled", color: "bg-slate-700 text-slate-400 line-through", dot: "bg-slate-600" },
  no_show: { label: "No Show", color: "bg-rose-800 text-rose-300", dot: "bg-rose-500" },
  completed: { label: "Completed", color: "bg-indigo-700 text-indigo-200", dot: "bg-indigo-400" },
} as const;

const TIME_SLOTS = [
  "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });
}

interface BookingSlotProps {
  booking?: Booking;
  room: Room;
  date: string;
  startTime: string;
  onBook: () => void;
  onStatusChange: (id: string, status: string) => void;
}

function BookingSlot({ booking, room, date, startTime, onBook, onStatusChange }: BookingSlotProps) {
  const [showMenu, setShowMenu] = useState(false);

  if (!booking) {
    return (
      <button
        onClick={onBook}
        className="w-full h-full min-h-[52px] border border-dashed border-slate-700 rounded-lg flex items-center justify-center group hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all"
      >
        <Plus className="h-4 w-4 text-slate-600 group-hover:text-indigo-400" />
      </button>
    );
  }

  const cfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
  const roomObj = typeof booking.roomId === "object" ? booking.roomId as any : null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`w-full min-h-[52px] rounded-lg px-2 py-1.5 text-left text-xs ${cfg.color} transition-all hover:opacity-90`}
      >
        <p className="font-semibold truncate">{booking.customerName}</p>
        <p className="opacity-80">{booking.groupSize} guests · #{booking.bookingRef}</p>
      </button>

      {showMenu && (
        <div className="absolute top-full left-0 z-50 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-700">
            <p className="text-xs font-semibold text-slate-200 truncate">{booking.customerName}</p>
            <p className="text-xs text-slate-400">{booking.bookingRef}</p>
          </div>
          {booking.status !== "confirmed" && (
            <button
              onClick={() => { onStatusChange(booking._id, "confirmed"); setShowMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-emerald-400 hover:bg-slate-700"
            >
              <Check className="h-3.5 w-3.5" /> Confirm
            </button>
          )}
          {booking.status !== "cancelled" && (
            <button
              onClick={() => { onStatusChange(booking._id, "cancelled"); setShowMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-400 hover:bg-slate-700"
            >
              <Ban className="h-3.5 w-3.5" /> Cancel
            </button>
          )}
          {booking.status !== "no_show" && (
            <button
              onClick={() => { onStatusChange(booking._id, "no_show"); setShowMenu(false); }}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-400 hover:bg-slate-700"
            >
              <AlertCircle className="h-3.5 w-3.5" /> No Show
            </button>
          )}
          <button
            onClick={() => setShowMenu(false)}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs text-slate-500 hover:bg-slate-700 border-t border-slate-700"
          >
            <X className="h-3.5 w-3.5" /> Close
          </button>
        </div>
      )}
    </div>
  );
}

interface NewBookingModalProps {
  rooms: Room[];
  defaultDate: string;
  defaultTime: string;
  defaultRoomId: string;
  onClose: () => void;
  onCreate: (payload: CreateBookingPayload) => Promise<any>;
}

function NewBookingModal({ rooms, defaultDate, defaultTime, defaultRoomId, onClose, onCreate }: NewBookingModalProps) {
  const [form, setForm] = useState({
    roomId: defaultRoomId,
    date: defaultDate,
    startTime: defaultTime,
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    groupSize: 2,
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedRoom = rooms.find((r) => r._id === form.roomId);

  const computeEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(":").map(Number);
    const total = h * 60 + m + duration;
    return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName.trim()) return setError("Customer name is required");
    setLoading(true);
    setError(null);

    const endTime = computeEndTime(form.startTime, selectedRoom?.sessionDurationMinutes ?? 60);
    const res = await onCreate({ ...form, endTime, groupSize: Number(form.groupSize) });
    setLoading(false);

    if (res.success) {
      onClose();
    } else {
      setError(res.message ?? "Failed to create booking");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-slate-900 ring-1 ring-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">New Booking</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 text-xs text-rose-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Room</label>
              <select
                value={form.roomId}
                onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Start Time</label>
              <select
                value={form.startTime}
                onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Group Size</label>
              <input
                type="number"
                min={1}
                max={selectedRoom?.capacity ?? 8}
                value={form.groupSize}
                onChange={(e) => setForm((f) => ({ ...f, groupSize: parseInt(e.target.value) || 1 }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {selectedRoom && (
                <p className="text-xs text-slate-500 mt-1">Max {selectedRoom.capacity}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Customer Name *</label>
            <input
              type="text"
              value={form.customerName}
              onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              placeholder="Full name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Email</label>
              <input
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Phone</label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                placeholder="Optional"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any special requests or notes..."
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors"
            >
              {loading ? "Creating..." : "Create Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [newBookingParams, setNewBookingParams] = useState<{
    date: string; time: string; roomId: string;
  } | null>(null);

  const dateStr = formatDate(currentDate);
  const { bookings, loading, createBooking, updateBookingStatus } = useBookings({ date: dateStr });
  const { rooms, loading: roomsLoading } = useRooms();

  // Group bookings by roomId + startTime
  const bookingMap = useMemo(() => {
    const map = new Map<string, Booking>();
    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      const roomId = typeof b.roomId === "object" ? (b.roomId as any)._id : b.roomId;
      map.set(`${roomId}::${b.startTime}`, b);
    }
    return map;
  }, [bookings]);

  const activeRooms = rooms.filter((r) => r.isActive);

  const confirmedCount = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length;
  const totalSlots = activeRooms.length * TIME_SLOTS.length;
  const fillRate = totalSlots > 0 ? Math.round((confirmedCount / totalSlots) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Booking Calendar</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage room bookings and availability</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Fill rate badge */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <div className={`h-2 w-2 rounded-full ${fillRate >= 80 ? "bg-emerald-400" : fillRate >= 50 ? "bg-amber-400" : "bg-rose-400"}`} />
            <span className="text-xs text-slate-300">{fillRate}% fill rate</span>
          </div>
          <button
            onClick={() => setNewBookingParams({ date: dateStr, time: "10:00", roomId: activeRooms[0]?._id ?? "" })}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* Date navigation */}
      <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
        <button
          onClick={() => setCurrentDate(addDays(currentDate, -1))}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-sm font-semibold text-slate-100">{formatDisplayDate(dateStr)}</p>
          <p className="text-xs text-slate-500">{bookings.length} booking{bookings.length !== 1 ? "s" : ""} · {confirmedCount} confirmed</p>
        </div>
        <button
          onClick={() => setCurrentDate(addDays(currentDate, 1))}
          className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCurrentDate(new Date())}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-400 hover:text-slate-100 rounded-lg"
        >
          Today
        </button>
      </div>

      {/* Calendar grid */}
      {loading || roomsLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-800 rounded animate-pulse" />
          ))}
        </div>
      ) : activeRooms.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500 text-sm">
          No active rooms. Add rooms first.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide w-20 sticky left-0 bg-slate-900">Time</th>
                {activeRooms.map((room) => (
                  <th key={room._id} className="px-2 py-3 text-center text-xs font-medium text-slate-300">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-semibold">{room.name}</span>
                      <span className="text-slate-500 font-normal">Cap {room.capacity}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map((time) => (
                <tr key={time} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="px-4 py-1.5 text-xs font-mono text-slate-500 sticky left-0 bg-slate-900/90 whitespace-nowrap">
                    {time}
                  </td>
                  {activeRooms.map((room) => {
                    const booking = bookingMap.get(`${room._id}::${time}`);
                    return (
                      <td key={room._id} className="px-1.5 py-1.5">
                        <BookingSlot
                          booking={booking}
                          room={room}
                          date={dateStr}
                          startTime={time}
                          onBook={() => setNewBookingParams({ date: dateStr, time, roomId: room._id })}
                          onStatusChange={updateBookingStatus}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${cfg.dot}`} />
            <span className="text-xs text-slate-500">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* New booking modal */}
      {newBookingParams && activeRooms.length > 0 && (
        <NewBookingModal
          rooms={activeRooms}
          defaultDate={newBookingParams.date}
          defaultTime={newBookingParams.time}
          defaultRoomId={newBookingParams.roomId}
          onClose={() => setNewBookingParams(null)}
          onCreate={createBooking}
        />
      )}
    </div>
  );
}

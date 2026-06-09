import { useState } from "react";
import { Plus, X, Building2, Star, Edit2, Trash2 } from "lucide-react";
import { useRooms, type Room } from "~/escapeops/rooms/hooks/use-rooms";

const ROOM_COLORS = ["#4F46E5", "#059669", "#D97706", "#DC2626", "#7C3AED", "#0891B2"];

function DifficultyStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-3 w-3 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
      ))}
    </div>
  );
}

interface RoomModalProps {
  room?: Room;
  onClose: () => void;
  onSave: (data: Partial<Room>) => Promise<any>;
}

function RoomModal({ room, onClose, onSave }: RoomModalProps) {
  const [form, setForm] = useState({
    name: room?.name ?? "",
    theme: room?.theme ?? "",
    description: room?.description ?? "",
    capacity: room?.capacity ?? 6,
    difficultyRating: room?.difficultyRating ?? 3,
    sessionDurationMinutes: room?.sessionDurationMinutes ?? 60,
    color: room?.color ?? ROOM_COLORS[0],
    isActive: room?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Room name is required");
    setLoading(true);
    const res = await onSave(form);
    setLoading(false);
    if (res.success) onClose();
    else setError(res.message ?? "Failed to save room");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-slate-900 ring-1 ring-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">{room ? "Edit Room" : "Add Room"}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 text-xs text-rose-400">{error}</div>}

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Room Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. The Alchemist's Lab"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Theme</label>
              <input
                type="text"
                value={form.theme}
                onChange={(e) => setForm((f) => ({ ...f, theme: e.target.value }))}
                placeholder="e.g. Victorian mystery"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Capacity</label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 1 }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Brief room description..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Session Duration (min)</label>
              <input
                type="number"
                min={30}
                max={240}
                step={15}
                value={form.sessionDurationMinutes}
                onChange={(e) => setForm((f) => ({ ...f, sessionDurationMinutes: parseInt(e.target.value) || 60 }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Difficulty</label>
              <input
                type="range"
                min={1}
                max={5}
                value={form.difficultyRating}
                onChange={(e) => setForm((f) => ({ ...f, difficultyRating: parseInt(e.target.value) }))}
                className="w-full accent-indigo-500 mt-2"
              />
              <DifficultyStars rating={form.difficultyRating} />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-2 block">Calendar Color</label>
            <div className="flex gap-2">
              {ROOM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`h-7 w-7 rounded-full transition-all ${form.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="accent-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm text-slate-300">Room is active and bookable</label>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Saving..." : room ? "Save Changes" : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function RoomsManager() {
  const { rooms, loading, createRoom, updateRoom, deleteRoom } = useRooms();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);

  const handleCreate = async (data: Partial<Room>) => {
    return createRoom(data);
  };

  const handleUpdate = async (data: Partial<Room>) => {
    if (!editRoom) return { success: false };
    return updateRoom(editRoom._id, data);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Rooms</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage your escape room inventory</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="h-4 w-4" /> Add Room
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <Building2 className="h-12 w-12 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No rooms yet. Add your first room to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room._id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden group">
              <div className="h-2" style={{ backgroundColor: room.color }} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 truncate">{room.name}</h3>
                    {room.theme && <p className="text-xs text-slate-500 truncate">{room.theme}</p>}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-medium ${
                    room.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700 text-slate-500"
                  }`}>
                    {room.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {room.description && (
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{room.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span>Max {room.capacity} guests</span>
                  <span>{room.sessionDurationMinutes} min</span>
                </div>

                <DifficultyStars rating={room.difficultyRating} />

                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditRoom(room)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs text-slate-300"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => deleteRoom(room._id)}
                    className="flex items-center justify-center px-3 py-1.5 bg-slate-800 hover:bg-rose-500/20 rounded-lg text-xs text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <RoomModal
          onClose={() => setShowAddModal(false)}
          onSave={handleCreate}
        />
      )}
      {editRoom && (
        <RoomModal
          room={editRoom}
          onClose={() => setEditRoom(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}

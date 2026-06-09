import { useState } from "react";
import {
  AlertTriangle, CheckCircle2, Wrench, Plus, ChevronDown, ChevronUp,
  RefreshCw, ClipboardList, X, Star,
} from "lucide-react";
import { usePuzzles, type Puzzle } from "~/escapeops/puzzles/hooks/use-puzzles";
import { useRooms } from "~/escapeops/rooms/hooks/use-rooms";

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20", dot: "bg-emerald-400" },
  under_repair: { label: "Under Repair", color: "bg-amber-500/15 text-amber-400 border border-amber-500/20", dot: "bg-amber-400" },
  retired: { label: "Retired", color: "bg-slate-700 text-slate-400", dot: "bg-slate-500" },
} as const;

function FreshnessIndicator({ score }: { score: number }) {
  const color = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400";
  const bgColor = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${bgColor}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-semibold w-8 text-right ${color}`}>{score}%</span>
    </div>
  );
}

function DifficultyStars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i <= rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`}
        />
      ))}
    </div>
  );
}

interface MaintenanceModalProps {
  puzzle: Puzzle;
  onClose: () => void;
  onSubmit: (id: string, payload: { technician: string; action: string; notes?: string }) => Promise<any>;
}

function MaintenanceModal({ puzzle, onClose, onSubmit }: MaintenanceModalProps) {
  const [form, setForm] = useState({ technician: "", action: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.technician.trim() || !form.action.trim()) return setError("Technician and action are required");
    setLoading(true);
    const res = await onSubmit(puzzle._id, form);
    setLoading(false);
    if (res.success) onClose();
    else setError(res.message ?? "Failed to log maintenance");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-slate-900 ring-1 ring-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Log Maintenance</h2>
            <p className="text-xs text-slate-400 mt-0.5">{puzzle.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 text-xs text-rose-400">{error}</div>
          )}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Technician / Game Master *</label>
            <input
              type="text"
              value={form.technician}
              onChange={(e) => setForm((f) => ({ ...f, technician: e.target.value }))}
              placeholder="Name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Action Taken *</label>
            <input
              type="text"
              value={form.action}
              onChange={(e) => setForm((f) => ({ ...f, action: e.target.value }))}
              placeholder="e.g. Replaced lock mechanism, Updated clue wording"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Additional details..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-slate-100">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Saving..." : "Log Maintenance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SessionNoteModalProps {
  puzzle: Puzzle;
  onClose: () => void;
  onSubmit: (id: string, payload: { gameMaster: string; note: string }) => Promise<any>;
}

function SessionNoteModal({ puzzle, onClose, onSubmit }: SessionNoteModalProps) {
  const [form, setForm] = useState({ gameMaster: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gameMaster.trim() || !form.note.trim()) return setError("All fields required");
    setLoading(true);
    const res = await onSubmit(puzzle._id, form);
    setLoading(false);
    if (res.success) onClose();
    else setError(res.message ?? "Failed to save note");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-slate-900 ring-1 ring-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Post-Session Note</h2>
            <p className="text-xs text-slate-400 mt-0.5">{puzzle.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 text-xs text-rose-400">{error}</div>}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Game Master *</label>
            <input
              type="text"
              value={form.gameMaster}
              onChange={(e) => setForm((f) => ({ ...f, gameMaster: e.target.value }))}
              placeholder="Your name"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Session Note *</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              rows={4}
              placeholder="Observations, hints given, player reactions, puzzle issues..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Saving..." : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PuzzleCardProps {
  puzzle: Puzzle;
  onLogMaintenance: () => void;
  onAddSessionNote: () => void;
  onMarkRefreshed: () => void;
  onStatusChange: (status: string) => void;
}

function PuzzleCard({ puzzle, onLogMaintenance, onAddSessionNote, onMarkRefreshed, onStatusChange }: PuzzleCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = STATUS_CONFIG[puzzle.status] ?? STATUS_CONFIG.active;
  const room = typeof puzzle.roomId === "object" ? puzzle.roomId as any : null;

  return (
    <div className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${puzzle.needsRefresh ? "border-amber-500/30" : "border-slate-800"}`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-sm font-semibold text-slate-100">{puzzle.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>
                {statusCfg.label}
              </span>
              {puzzle.needsRefresh && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Needs Refresh
                </span>
              )}
            </div>
            {room && <p className="text-xs text-slate-500 mb-2">{room.name}</p>}
            <DifficultyStars rating={puzzle.difficultyRating} />
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-500 mb-1">Freshness</p>
            <p className={`text-lg font-bold ${puzzle.freshnessScore >= 70 ? "text-emerald-400" : puzzle.freshnessScore >= 40 ? "text-amber-400" : "text-rose-400"}`}>
              {puzzle.freshnessScore}%
            </p>
          </div>
        </div>

        <div className="mt-3">
          <FreshnessIndicator score={puzzle.freshnessScore} />
        </div>

        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
          <span>{puzzle.playCount} plays</span>
          {puzzle.lastRefreshedAt && (
            <span>Refreshed {new Date(puzzle.lastRefreshedAt).toLocaleDateString()}</span>
          )}
          <span>{puzzle.maintenanceLogs.length} maintenance logs</span>
        </div>
      </div>

      <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={onLogMaintenance}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors"
        >
          <Wrench className="h-3.5 w-3.5" /> Log Maintenance
        </button>
        <button
          onClick={onAddSessionNote}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg transition-colors"
        >
          <ClipboardList className="h-3.5 w-3.5" /> Session Note
        </button>
        {puzzle.needsRefresh && (
          <button
            onClick={onMarkRefreshed}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-xs text-emerald-400 border border-emerald-500/20 rounded-lg transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Mark Refreshed
          </button>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-500 hover:text-slate-300 ml-auto"
        >
          History {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-slate-800 p-4 space-y-4">
          {/* Maintenance logs */}
          {puzzle.maintenanceLogs.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Maintenance History</h4>
              <div className="space-y-2">
                {puzzle.maintenanceLogs.slice(0, 5).map((log, i) => (
                  <div key={i} className="bg-slate-800/60 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-300">{log.technician}</span>
                      <span className="text-xs text-slate-500">{log.date}</span>
                    </div>
                    <p className="text-xs text-slate-400">{log.action}</p>
                    {log.notes && <p className="text-xs text-slate-500 mt-1">{log.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session notes */}
          {puzzle.sessionNotes.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recent Session Notes</h4>
              <div className="space-y-2">
                {puzzle.sessionNotes.slice(0, 3).map((note, i) => (
                  <div key={i} className="bg-slate-800/60 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-300">{note.gameMaster}</span>
                      <span className="text-xs text-slate-500">{note.date}</span>
                    </div>
                    <p className="text-xs text-slate-400">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {puzzle.maintenanceLogs.length === 0 && puzzle.sessionNotes.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-2">No history yet</p>
          )}
        </div>
      )}
    </div>
  );
}

interface AddPuzzleModalProps {
  rooms: any[];
  onClose: () => void;
  onCreate: (payload: any) => Promise<any>;
}

function AddPuzzleModal({ rooms, onClose, onCreate }: AddPuzzleModalProps) {
  const [form, setForm] = useState({ roomId: rooms[0]?._id ?? "", name: "", description: "", difficultyRating: 3 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Puzzle name is required");
    setLoading(true);
    const res = await onCreate(form);
    setLoading(false);
    if (res.success) onClose();
    else setError(res.message ?? "Failed to create puzzle");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md bg-slate-900 ring-1 ring-slate-700 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-100">Add Puzzle</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><X className="h-4 w-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2 text-xs text-rose-400">{error}</div>}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Room *</label>
            <select
              value={form.roomId}
              onChange={(e) => setForm((f) => ({ ...f, roomId: e.target.value }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {rooms.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Puzzle Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Element Cipher"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Brief description of the puzzle..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Difficulty (1–5)</label>
            <input
              type="range"
              min={1}
              max={5}
              value={form.difficultyRating}
              onChange={(e) => setForm((f) => ({ ...f, difficultyRating: parseInt(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Easy</span>
              <span className="text-slate-300 font-medium">{form.difficultyRating}/5</span>
              <span>Hard</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium text-white disabled:opacity-50">
              {loading ? "Creating..." : "Add Puzzle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function PuzzleTracker() {
  const { puzzles, loading, createPuzzle, addMaintenanceLog, addSessionNote, markRefreshed, updateStatus } = usePuzzles();
  const { rooms } = useRooms();
  const [filterRoom, setFilterRoom] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [maintenanceTarget, setMaintenanceTarget] = useState<Puzzle | null>(null);
  const [sessionNoteTarget, setSessionNoteTarget] = useState<Puzzle | null>(null);

  const filtered = puzzles.filter((p) => {
    if (filterRoom !== "all") {
      const roomId = typeof p.roomId === "object" ? (p.roomId as any)._id : p.roomId;
      if (roomId !== filterRoom) return false;
    }
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    return true;
  });

  const alertCount = puzzles.filter((p) => p.needsRefresh || p.status === "under_repair").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Puzzle Tracker</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track freshness, maintenance, and session notes for all puzzles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Puzzle
        </button>
      </div>

      {/* Alert banner */}
      {alertCount > 0 && (
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <p className="text-sm text-amber-300">
            {alertCount} puzzle{alertCount !== 1 ? "s" : ""} need attention — check items flagged below
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Rooms</option>
          {rooms.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="under_repair">Under Repair</option>
          <option value="retired">Retired</option>
        </select>
        <div className="flex items-center gap-2 text-xs text-slate-500 ml-auto">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Healthy
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Needs attention
          <Wrench className="h-3.5 w-3.5 text-rose-400" /> Under repair
        </div>
      </div>

      {/* Puzzle grid */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-slate-900 rounded-xl border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-500 text-sm">
          No puzzles found. Add puzzles to rooms to start tracking.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((puzzle) => (
            <PuzzleCard
              key={puzzle._id}
              puzzle={puzzle}
              onLogMaintenance={() => setMaintenanceTarget(puzzle)}
              onAddSessionNote={() => setSessionNoteTarget(puzzle)}
              onMarkRefreshed={() => markRefreshed(puzzle._id)}
              onStatusChange={(status) => updateStatus(puzzle._id, status)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddPuzzleModal
          rooms={rooms}
          onClose={() => setShowAddModal(false)}
          onCreate={createPuzzle}
        />
      )}
      {maintenanceTarget && (
        <MaintenanceModal
          puzzle={maintenanceTarget}
          onClose={() => setMaintenanceTarget(null)}
          onSubmit={addMaintenanceLog}
        />
      )}
      {sessionNoteTarget && (
        <SessionNoteModal
          puzzle={sessionNoteTarget}
          onClose={() => setSessionNoteTarget(null)}
          onSubmit={addSessionNote}
        />
      )}
    </div>
  );
}

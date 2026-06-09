import { useState, useEffect, useCallback } from "react";
import { apiRequest, apiGet } from "~/lib/api.client";

export interface PuzzleRoom {
  _id: string;
  name: string;
  theme: string;
  color: string;
}

export interface MaintenanceLog {
  date: string;
  technician: string;
  action: string;
  notes: string;
  createdAt: string;
}

export interface SessionNote {
  date: string;
  gameMaster: string;
  note: string;
  createdAt: string;
}

export interface Puzzle {
  _id: string;
  roomId: PuzzleRoom | string;
  name: string;
  description: string;
  difficultyRating: number;
  status: "active" | "under_repair" | "retired";
  playCount: number;
  lastRefreshedAt: string;
  needsRefresh: boolean;
  freshnessScore: number;
  maintenanceLogs: MaintenanceLog[];
  sessionNotes: SessionNote[];
  createdAt: string;
  updatedAt: string;
}

export function usePuzzles(roomId?: string) {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPuzzles = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<Puzzle[]>("/api/puzzles", roomId ? { roomId } : undefined);
    if (res.success && res.data) setPuzzles(res.data);
    else setError(res.message ?? "Failed to fetch puzzles");
    setLoading(false);
  }, [roomId]);

  useEffect(() => { fetchPuzzles(); }, [fetchPuzzles]);

  const createPuzzle = async (payload: Partial<Puzzle> & { roomId: string; name: string }) => {
    const res = await apiRequest<Puzzle>("/api/puzzles", { method: "POST", data: payload });
    if (res.success) await fetchPuzzles();
    return res;
  };

  const updatePuzzle = async (id: string, payload: Partial<Puzzle>) => {
    const res = await apiRequest<Puzzle>("/api/puzzles/" + id, { method: "PUT", data: payload });
    if (res.success) await fetchPuzzles();
    return res;
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await apiRequest<Puzzle>("/api/puzzles/" + id + "/status", { method: "PATCH", data: { status } });
    if (res.success) await fetchPuzzles();
    return res;
  };

  const addMaintenanceLog = async (id: string, payload: { technician: string; action: string; notes?: string }) => {
    const res = await apiRequest<Puzzle>("/api/puzzles/" + id + "/maintenance", { method: "POST", data: payload });
    if (res.success) await fetchPuzzles();
    return res;
  };

  const addSessionNote = async (id: string, payload: { gameMaster: string; note: string }) => {
    const res = await apiRequest<Puzzle>("/api/puzzles/" + id + "/session-notes", { method: "POST", data: payload });
    if (res.success) await fetchPuzzles();
    return res;
  };

  const markRefreshed = async (id: string) => {
    const res = await apiRequest<Puzzle>("/api/puzzles/" + id + "/refreshed", { method: "PATCH", data: {} });
    if (res.success) await fetchPuzzles();
    return res;
  };

  const deletePuzzle = async (id: string) => {
    const res = await apiRequest("/api/puzzles/" + id, { method: "DELETE" });
    if (res.success) await fetchPuzzles();
    return res;
  };

  return { puzzles, loading, error, refetch: fetchPuzzles, createPuzzle, updatePuzzle, updateStatus, addMaintenanceLog, addSessionNote, markRefreshed, deletePuzzle };
}

export function usePuzzleAlerts() {
  const [alerts, setAlerts] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Puzzle[]>("/api/puzzles/alerts").then((res) => {
      if (res.success && res.data) setAlerts(res.data);
      setLoading(false);
    });
  }, []);

  return { alerts, loading };
}

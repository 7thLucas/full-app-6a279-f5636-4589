import { useState, useEffect, useCallback } from "react";
import { apiRequest, apiGet } from "~/lib/api.client";

export interface ShiftRoom {
  _id: string;
  name: string;
  theme: string;
  color: string;
}

export interface Shift {
  _id: string;
  staffId: string;
  staffName: string;
  role: "owner" | "manager" | "game_master";
  date: string;
  startTime: string;
  endTime: string;
  roomId?: ShiftRoom | string;
  status: "scheduled" | "confirmed" | "cancelled" | "completed";
  notes: string;
  createdAt: string;
}

export interface CreateShiftPayload {
  staffId: string;
  staffName: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  roomId?: string;
  notes?: string;
}

export function useShifts(filters?: { date?: string; staffId?: string; startDate?: string; endDate?: string }) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<Shift[]>("/api/shifts", filters);
    if (res.success && res.data) setShifts(res.data);
    else setError(res.message ?? "Failed to fetch shifts");
    setLoading(false);
  }, [filters?.date, filters?.staffId, filters?.startDate, filters?.endDate]);

  useEffect(() => { fetchShifts(); }, [fetchShifts]);

  const createShift = async (payload: CreateShiftPayload) => {
    const res = await apiRequest<Shift>("/api/shifts", { method: "POST", data: payload });
    if (res.success) await fetchShifts();
    return res;
  };

  const updateShift = async (id: string, payload: Partial<CreateShiftPayload & { status: string }>) => {
    const res = await apiRequest<Shift>("/api/shifts/" + id, { method: "PUT", data: payload });
    if (res.success) await fetchShifts();
    return res;
  };

  const deleteShift = async (id: string) => {
    const res = await apiRequest("/api/shifts/" + id, { method: "DELETE" });
    if (res.success) await fetchShifts();
    return res;
  };

  return { shifts, loading, error, refetch: fetchShifts, createShift, updateShift, deleteShift };
}

export function useWeekShifts(weekStart: string) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWeekShifts = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<Shift[]>("/api/shifts/week", { weekStart });
    if (res.success && res.data) setShifts(res.data);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => { fetchWeekShifts(); }, [fetchWeekShifts]);

  return { shifts, loading, refetch: fetchWeekShifts };
}

export function useTodayOnDuty() {
  const [staff, setStaff] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Shift[]>("/api/shifts/today").then((res) => {
      if (res.success && res.data) setStaff(res.data);
      setLoading(false);
    });
  }, []);

  return { staff, loading };
}

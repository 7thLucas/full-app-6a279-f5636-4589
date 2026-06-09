import { useState, useEffect, useCallback } from "react";
import { apiRequest, apiGet } from "~/lib/api.client";

export interface Room {
  _id: string;
  name: string;
  theme: string;
  description: string;
  capacity: number;
  difficultyRating: number;
  sessionDurationMinutes: number;
  isActive: boolean;
  color: string;
}

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    const res = await apiGet<Room[]>("/api/rooms");
    if (res.success && res.data) setRooms(res.data);
    else setError(res.message ?? "Failed to fetch rooms");
    setLoading(false);
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  const createRoom = async (payload: Partial<Room>) => {
    const res = await apiRequest<Room>("/api/rooms", { method: "POST", data: payload });
    if (res.success) await fetchRooms();
    return res;
  };

  const updateRoom = async (id: string, payload: Partial<Room>) => {
    const res = await apiRequest<Room>("/api/rooms/" + id, { method: "PUT", data: payload });
    if (res.success) await fetchRooms();
    return res;
  };

  const deleteRoom = async (id: string) => {
    const res = await apiRequest("/api/rooms/" + id, { method: "DELETE" });
    if (res.success) await fetchRooms();
    return res;
  };

  return { rooms, loading, error, refetch: fetchRooms, createRoom, updateRoom, deleteRoom };
}

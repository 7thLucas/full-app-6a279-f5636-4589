import { useState, useEffect, useCallback } from "react";
import { apiRequest, apiGet } from "~/lib/api.client";

export interface BookingRoom {
  _id: string;
  name: string;
  capacity: number;
  color: string;
  theme: string;
}

export interface Booking {
  _id: string;
  roomId: BookingRoom | string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  groupSize: number;
  status: "pending" | "confirmed" | "cancelled" | "no_show" | "completed";
  notes: string;
  bookingRef: string;
  isWaitlisted: boolean;
  createdAt: string;
}

export interface TodayStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  roomsInUse: number;
  totalRooms: number;
}

export interface CreateBookingPayload {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  groupSize: number;
  notes?: string;
  isWaitlisted?: boolean;
}

export function useBookings(filters?: { date?: string; roomId?: string; startDate?: string; endDate?: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await apiGet<Booking[]>("/api/bookings", filters);
    if (res.success && res.data) {
      setBookings(res.data);
    } else {
      setError(res.message ?? "Failed to fetch bookings");
    }
    setLoading(false);
  }, [filters?.date, filters?.roomId, filters?.startDate, filters?.endDate]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const createBooking = async (payload: CreateBookingPayload) => {
    const res = await apiRequest<Booking>("/api/bookings", { method: "POST", data: payload });
    if (res.success) await fetchBookings();
    return res;
  };

  const updateBookingStatus = async (id: string, status: string) => {
    const res = await apiRequest("/api/bookings/" + id + "/status", { method: "PATCH", data: { status } });
    if (res.success) await fetchBookings();
    return res;
  };

  const deleteBooking = async (id: string) => {
    const res = await apiRequest("/api/bookings/" + id, { method: "DELETE" });
    if (res.success) await fetchBookings();
    return res;
  };

  return { bookings, loading, error, refetch: fetchBookings, createBooking, updateBookingStatus, deleteBooking };
}

export function useTodayStats() {
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<TodayStats>("/api/bookings/stats/today").then((res) => {
      if (res.success && res.data) setStats(res.data);
      setLoading(false);
    });
  }, []);

  return { stats, loading };
}

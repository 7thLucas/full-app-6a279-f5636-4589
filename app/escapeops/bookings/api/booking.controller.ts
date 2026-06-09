import type { Request, Response } from "express";
import { BookingService } from "./booking.service";
import { BookingStatus } from "./booking.model";

export const BookingController = {
  async list(req: Request, res: Response) {
    try {
      const { date, roomId, status, startDate, endDate } = req.query as Record<string, string>;
      const bookings = await BookingService.findAll({ date, roomId, status: status as BookingStatus, startDate, endDate });
      res.json({ success: true, data: bookings });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const booking = await BookingService.findById(req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
      res.json({ success: true, data: booking });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const booking = await BookingService.create(req.body);
      res.status(201).json({ success: true, data: booking });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const booking = await BookingService.update(req.params.id, req.body);
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
      res.json({ success: true, data: booking });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const booking = await BookingService.updateStatus(req.params.id, status);
      if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
      res.json({ success: true, data: booking });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await BookingService.softDelete(req.params.id);
      res.json({ success: true, message: "Booking deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getTodayStats(req: Request, res: Response) {
    try {
      const stats = await BookingService.getTodayStats();
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getFillRateStats(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query as Record<string, string>;
      if (!startDate || !endDate) return res.status(400).json({ success: false, message: "startDate and endDate are required" });
      const stats = await BookingService.getFillRateStats(startDate, endDate);
      res.json({ success: true, data: stats });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

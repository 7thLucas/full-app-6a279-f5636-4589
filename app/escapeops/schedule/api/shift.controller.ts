import type { Request, Response } from "express";
import { ShiftService } from "./shift.service";
import { ShiftRole } from "./shift.model";

export const ShiftController = {
  async list(req: Request, res: Response) {
    try {
      const { date, staffId, startDate, endDate, role } = req.query as Record<string, string>;
      const shifts = await ShiftService.findAll({ date, staffId, startDate, endDate, role: role as ShiftRole });
      res.json({ success: true, data: shifts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getByWeek(req: Request, res: Response) {
    try {
      const { weekStart } = req.query as { weekStart?: string };
      if (!weekStart) return res.status(400).json({ success: false, message: "weekStart is required" });
      const shifts = await ShiftService.findByWeek(weekStart);
      res.json({ success: true, data: shifts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const shift = await ShiftService.findById(req.params.id);
      if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });
      res.json({ success: true, data: shift });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const shift = await ShiftService.create(req.body);
      res.status(201).json({ success: true, data: shift });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const shift = await ShiftService.update(req.params.id, req.body);
      if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });
      res.json({ success: true, data: shift });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await ShiftService.softDelete(req.params.id);
      res.json({ success: true, message: "Shift deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getTodayOnDuty(req: Request, res: Response) {
    try {
      const staff = await ShiftService.getTodayOnDuty();
      res.json({ success: true, data: staff });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

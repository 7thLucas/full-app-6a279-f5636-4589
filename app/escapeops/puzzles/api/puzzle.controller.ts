import type { Request, Response } from "express";
import { PuzzleService } from "./puzzle.service";
import { PuzzleStatus } from "./puzzle.model";

export const PuzzleController = {
  async list(req: Request, res: Response) {
    try {
      const { roomId } = req.query as { roomId?: string };
      const puzzles = await PuzzleService.findAll(roomId);
      res.json({ success: true, data: puzzles });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const puzzle = await PuzzleService.findById(req.params.id);
      if (!puzzle) return res.status(404).json({ success: false, message: "Puzzle not found" });
      res.json({ success: true, data: puzzle });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const puzzle = await PuzzleService.create(req.body);
      res.status(201).json({ success: true, data: puzzle });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const puzzle = await PuzzleService.update(req.params.id, req.body);
      if (!puzzle) return res.status(404).json({ success: false, message: "Puzzle not found" });
      res.json({ success: true, data: puzzle });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      const puzzle = await PuzzleService.updateStatus(req.params.id, status as PuzzleStatus);
      if (!puzzle) return res.status(404).json({ success: false, message: "Puzzle not found" });
      res.json({ success: true, data: puzzle });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async addMaintenanceLog(req: Request, res: Response) {
    try {
      const puzzle = await PuzzleService.addMaintenanceLog(req.params.id, req.body);
      res.json({ success: true, data: puzzle });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async addSessionNote(req: Request, res: Response) {
    try {
      const puzzle = await PuzzleService.addSessionNote(req.params.id, req.body);
      res.json({ success: true, data: puzzle });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async markRefreshed(req: Request, res: Response) {
    try {
      const puzzle = await PuzzleService.markAsRefreshed(req.params.id);
      res.json({ success: true, data: puzzle });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async getAlerts(req: Request, res: Response) {
    try {
      const alerts = await PuzzleService.getMaintenanceAlerts();
      res.json({ success: true, data: alerts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await PuzzleService.softDelete(req.params.id);
      res.json({ success: true, message: "Puzzle deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

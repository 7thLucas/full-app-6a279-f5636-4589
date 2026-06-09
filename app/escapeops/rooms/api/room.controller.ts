import type { Request, Response } from "express";
import { RoomService } from "./room.service";

export const RoomController = {
  async list(req: Request, res: Response) {
    try {
      const rooms = await RoomService.findAll();
      res.json({ success: true, data: rooms });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const room = await RoomService.findById(req.params.id);
      if (!room) return res.status(404).json({ success: false, message: "Room not found" });
      res.json({ success: true, data: room });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const room = await RoomService.create(req.body);
      res.status(201).json({ success: true, data: room });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const room = await RoomService.update(req.params.id, req.body);
      if (!room) return res.status(404).json({ success: false, message: "Room not found" });
      res.json({ success: true, data: room });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  async remove(req: Request, res: Response) {
    try {
      await RoomService.softDelete(req.params.id);
      res.json({ success: true, message: "Room deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};

import { Router } from "express";
import { BookingController } from "./booking.controller";
import { requireAuth } from "~/modules/authentication/authentication.middleware";

const router = Router();

router.get("/bookings/stats/today", requireAuth, BookingController.getTodayStats);
router.get("/bookings/stats/fillrate", requireAuth, BookingController.getFillRateStats);
router.get("/bookings", requireAuth, BookingController.list);
router.get("/bookings/:id", requireAuth, BookingController.getById);
router.post("/bookings", requireAuth, BookingController.create);
router.put("/bookings/:id", requireAuth, BookingController.update);
router.patch("/bookings/:id/status", requireAuth, BookingController.updateStatus);
router.delete("/bookings/:id", requireAuth, BookingController.remove);

export default router;

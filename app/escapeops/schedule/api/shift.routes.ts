import { Router } from "express";
import { ShiftController } from "./shift.controller";
import { requireAuth } from "~/modules/authentication/authentication.middleware";

const router = Router();

router.get("/shifts/today", requireAuth, ShiftController.getTodayOnDuty);
router.get("/shifts/week", requireAuth, ShiftController.getByWeek);
router.get("/shifts", requireAuth, ShiftController.list);
router.get("/shifts/:id", requireAuth, ShiftController.getById);
router.post("/shifts", requireAuth, ShiftController.create);
router.put("/shifts/:id", requireAuth, ShiftController.update);
router.delete("/shifts/:id", requireAuth, ShiftController.remove);

export default router;

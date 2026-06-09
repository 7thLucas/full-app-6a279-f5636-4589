import { Router } from "express";
import { PuzzleController } from "./puzzle.controller";
import { requireAuth } from "~/modules/authentication/authentication.middleware";

const router = Router();

router.get("/puzzles/alerts", requireAuth, PuzzleController.getAlerts);
router.get("/puzzles", requireAuth, PuzzleController.list);
router.get("/puzzles/:id", requireAuth, PuzzleController.getById);
router.post("/puzzles", requireAuth, PuzzleController.create);
router.put("/puzzles/:id", requireAuth, PuzzleController.update);
router.patch("/puzzles/:id/status", requireAuth, PuzzleController.updateStatus);
router.patch("/puzzles/:id/refreshed", requireAuth, PuzzleController.markRefreshed);
router.post("/puzzles/:id/maintenance", requireAuth, PuzzleController.addMaintenanceLog);
router.post("/puzzles/:id/session-notes", requireAuth, PuzzleController.addSessionNote);
router.delete("/puzzles/:id", requireAuth, PuzzleController.remove);

export default router;

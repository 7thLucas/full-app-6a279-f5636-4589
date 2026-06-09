import { Router } from "express";
import { RoomController } from "./room.controller";
import { requireAuth } from "~/modules/authentication/authentication.middleware";

const router = Router();

router.get("/rooms", requireAuth, RoomController.list);
router.get("/rooms/:id", requireAuth, RoomController.getById);
router.post("/rooms", requireAuth, RoomController.create);
router.put("/rooms/:id", requireAuth, RoomController.update);
router.delete("/rooms/:id", requireAuth, RoomController.remove);

export default router;

import { PuzzleModel, PuzzleStatus, type MaintenanceLogEntry } from "./puzzle.model";

export interface CreatePuzzleDto {
  roomId: string;
  name: string;
  description?: string;
  difficultyRating?: number;
  status?: PuzzleStatus;
}

export interface UpdatePuzzleDto extends Partial<CreatePuzzleDto> {
  needsRefresh?: boolean;
}

export interface AddMaintenanceLogDto {
  technician: string;
  action: string;
  notes?: string;
}

export interface AddSessionNoteDto {
  gameMaster: string;
  note: string;
}

function computeFreshnessScore(lastRefreshedAt: Date | undefined, playCount: number, thresholdDays = 30): number {
  if (!lastRefreshedAt) return Math.max(0, 100 - playCount * 2);
  const daysSinceRefresh = (Date.now() - lastRefreshedAt.getTime()) / (1000 * 60 * 60 * 24);
  const agePenalty = Math.min(100, (daysSinceRefresh / thresholdDays) * 50);
  const playPenalty = Math.min(50, playCount * 0.5);
  return Math.max(0, Math.round(100 - agePenalty - playPenalty));
}

export const PuzzleService = {
  async findAll(roomId?: string) {
    const query: Record<string, any> = { deletedAt: null };
    if (roomId) query.roomId = roomId;
    return PuzzleModel.find(query)
      .populate("roomId", "name theme color")
      .sort({ roomId: 1, name: 1 })
      .lean();
  },

  async findById(id: string) {
    return PuzzleModel.findOne({ _id: id, deletedAt: null })
      .populate("roomId", "name theme color")
      .lean();
  },

  async create(dto: CreatePuzzleDto) {
    return PuzzleModel.create({
      ...dto,
      freshnessScore: 100,
      lastRefreshedAt: new Date(),
    });
  },

  async update(id: string, dto: UpdatePuzzleDto) {
    return PuzzleModel.findByIdAndUpdate(id, dto, { new: true })
      .populate("roomId", "name theme color")
      .lean();
  },

  async addMaintenanceLog(id: string, dto: AddMaintenanceLogDto) {
    const logEntry: MaintenanceLogEntry = {
      date: new Date().toISOString().split("T")[0],
      technician: dto.technician,
      action: dto.action,
      notes: dto.notes ?? "",
      createdAt: new Date().toISOString(),
    };

    const puzzle = await PuzzleModel.findByIdAndUpdate(
      id,
      {
        $push: { maintenanceLogs: { $each: [logEntry], $position: 0 } },
        $set: { lastRefreshedAt: new Date(), needsRefresh: false },
      },
      { new: true }
    ).populate("roomId", "name theme color").lean();

    if (puzzle) {
      const score = computeFreshnessScore(
        puzzle.lastRefreshedAt ? new Date(puzzle.lastRefreshedAt) : undefined,
        puzzle.playCount
      );
      await PuzzleModel.findByIdAndUpdate(id, { freshnessScore: score });
    }

    return puzzle;
  },

  async addSessionNote(id: string, dto: AddSessionNoteDto) {
    const noteEntry = {
      date: new Date().toISOString().split("T")[0],
      gameMaster: dto.gameMaster,
      note: dto.note,
      createdAt: new Date().toISOString(),
    };

    const puzzle = await PuzzleModel.findByIdAndUpdate(
      id,
      {
        $push: { sessionNotes: { $each: [noteEntry], $position: 0 } },
        $inc: { playCount: 1 },
      },
      { new: true }
    ).lean();

    if (puzzle) {
      const score = computeFreshnessScore(
        puzzle.lastRefreshedAt ? new Date(puzzle.lastRefreshedAt) : undefined,
        puzzle.playCount
      );
      const needsRefresh = score < 40;
      await PuzzleModel.findByIdAndUpdate(id, { freshnessScore: score, needsRefresh });
    }

    return PuzzleModel.findById(id).populate("roomId", "name theme color").lean();
  },

  async markAsRefreshed(id: string) {
    return PuzzleModel.findByIdAndUpdate(
      id,
      { lastRefreshedAt: new Date(), needsRefresh: false, freshnessScore: 100 },
      { new: true }
    ).lean();
  },

  async updateStatus(id: string, status: PuzzleStatus) {
    return PuzzleModel.findByIdAndUpdate(id, { status }, { new: true })
      .populate("roomId", "name theme color")
      .lean();
  },

  async softDelete(id: string) {
    return PuzzleModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).lean();
  },

  async getMaintenanceAlerts() {
    return PuzzleModel.find({
      $or: [{ needsRefresh: true }, { status: PuzzleStatus.UnderRepair }, { freshnessScore: { $lt: 40 } }],
      deletedAt: null,
    })
      .populate("roomId", "name theme color")
      .sort({ freshnessScore: 1 })
      .lean();
  },
};

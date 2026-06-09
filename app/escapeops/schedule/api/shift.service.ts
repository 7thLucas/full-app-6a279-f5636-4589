import { ShiftModel, ShiftRole, ShiftStatus } from "./shift.model";

export interface CreateShiftDto {
  staffId: string;
  staffName: string;
  role: ShiftRole;
  date: string;
  startTime: string;
  endTime: string;
  roomId?: string;
  notes?: string;
}

export interface UpdateShiftDto extends Partial<CreateShiftDto> {
  status?: ShiftStatus;
}

export interface ShiftFilters {
  date?: string;
  staffId?: string;
  startDate?: string;
  endDate?: string;
  role?: ShiftRole;
}

export const ShiftService = {
  async findAll(filters: ShiftFilters = {}) {
    const query: Record<string, any> = { deletedAt: null };

    if (filters.date) query.date = filters.date;
    if (filters.staffId) query.staffId = filters.staffId;
    if (filters.role) query.role = filters.role;
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    return ShiftModel.find(query)
      .populate("roomId", "name theme color")
      .sort({ date: 1, startTime: 1 })
      .lean();
  },

  async findById(id: string) {
    return ShiftModel.findOne({ _id: id, deletedAt: null })
      .populate("roomId", "name theme color")
      .lean();
  },

  async findByWeek(weekStartDate: string) {
    const start = new Date(weekStartDate);
    const end = new Date(weekStartDate);
    end.setDate(end.getDate() + 6);

    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    return ShiftModel.find({
      date: { $gte: startStr, $lte: endStr },
      deletedAt: null,
    })
      .populate("roomId", "name theme color")
      .sort({ date: 1, startTime: 1 })
      .lean();
  },

  async create(dto: CreateShiftDto) {
    return ShiftModel.create(dto);
  },

  async update(id: string, dto: UpdateShiftDto) {
    return ShiftModel.findByIdAndUpdate(id, dto, { new: true })
      .populate("roomId", "name theme color")
      .lean();
  },

  async softDelete(id: string) {
    return ShiftModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).lean();
  },

  async getTodayOnDuty() {
    const today = new Date().toISOString().split("T")[0];
    return ShiftModel.find({
      date: today,
      status: { $nin: [ShiftStatus.Cancelled] },
      deletedAt: null,
    })
      .populate("roomId", "name theme color")
      .sort({ startTime: 1 })
      .lean();
  },
};

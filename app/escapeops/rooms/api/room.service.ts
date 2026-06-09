import { RoomModel } from "./room.model";

export interface CreateRoomDto {
  name: string;
  theme?: string;
  description?: string;
  capacity: number;
  difficultyRating?: number;
  sessionDurationMinutes?: number;
  color?: string;
}

export interface UpdateRoomDto extends Partial<CreateRoomDto> {
  isActive?: boolean;
}

export const RoomService = {
  async findAll() {
    return RoomModel.find({ deletedAt: null }).sort({ name: 1 }).lean();
  },

  async findById(id: string) {
    return RoomModel.findOne({ _id: id, deletedAt: null }).lean();
  },

  async create(dto: CreateRoomDto) {
    return RoomModel.create(dto);
  },

  async update(id: string, dto: UpdateRoomDto) {
    return RoomModel.findByIdAndUpdate(id, dto, { new: true }).lean();
  },

  async softDelete(id: string) {
    return RoomModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).lean();
  },

  async seed(rooms: { name: string; theme: string; capacity: number; difficultyRating: number }[]) {
    for (const room of rooms) {
      const existing = await RoomModel.findOne({ name: room.name });
      if (!existing) {
        await RoomModel.create({ ...room, isActive: true });
      }
    }
  },
};

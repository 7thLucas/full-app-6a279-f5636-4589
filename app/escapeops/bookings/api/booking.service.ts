import { BookingModel, BookingStatus } from "./booking.model";
import { RoomModel } from "~/escapeops/rooms/api/room.model";
import crypto from "node:crypto";

export interface CreateBookingDto {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  groupSize: number;
  notes?: string;
  isWaitlisted?: boolean;
}

export interface UpdateBookingDto extends Partial<CreateBookingDto> {
  status?: BookingStatus;
}

export interface BookingFilters {
  date?: string;
  roomId?: string;
  status?: BookingStatus;
  startDate?: string;
  endDate?: string;
}

function generateBookingRef(): string {
  return "EO-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export const BookingService = {
  async findAll(filters: BookingFilters = {}) {
    const query: Record<string, any> = { deletedAt: null };

    if (filters.date) query.date = filters.date;
    if (filters.roomId) query.roomId = filters.roomId;
    if (filters.status) query.status = filters.status;
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = filters.startDate;
      if (filters.endDate) query.date.$lte = filters.endDate;
    }

    return BookingModel.find(query)
      .populate("roomId", "name capacity color theme")
      .sort({ date: 1, startTime: 1 })
      .lean();
  },

  async findById(id: string) {
    return BookingModel.findOne({ _id: id, deletedAt: null })
      .populate("roomId", "name capacity color theme sessionDurationMinutes")
      .lean();
  },

  async findByDate(date: string) {
    return BookingModel.find({ date, deletedAt: null })
      .populate("roomId", "name capacity color theme")
      .sort({ startTime: 1 })
      .lean();
  },

  async create(dto: CreateBookingDto) {
    const room = await RoomModel.findById(dto.roomId).lean();
    if (!room) throw new Error("Room not found");
    if (dto.groupSize > room.capacity) throw new Error(`Group size exceeds room capacity of ${room.capacity}`);

    if (!dto.isWaitlisted) {
      const conflicts = await BookingModel.find({
        roomId: dto.roomId,
        date: dto.date,
        isWaitlisted: false,
        status: { $nin: [BookingStatus.Cancelled] },
        deletedAt: null,
        $or: [
          { startTime: { $lt: dto.endTime }, endTime: { $gt: dto.startTime } },
        ],
      });
      if (conflicts.length > 0) throw new Error("This slot is already booked for that room");
    }

    const bookingRef = generateBookingRef();
    return BookingModel.create({ ...dto, bookingRef });
  },

  async updateStatus(id: string, status: BookingStatus) {
    return BookingModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
  },

  async update(id: string, dto: UpdateBookingDto) {
    return BookingModel.findByIdAndUpdate(id, dto, { new: true })
      .populate("roomId", "name capacity color theme")
      .lean();
  },

  async softDelete(id: string) {
    return BookingModel.findByIdAndUpdate(id, { deletedAt: new Date() }, { new: true }).lean();
  },

  async getFillRateStats(startDate: string, endDate: string) {
    const rooms = await RoomModel.find({ deletedAt: null, isActive: true }).lean();
    const bookings = await BookingModel.find({
      date: { $gte: startDate, $lte: endDate },
      isWaitlisted: false,
      status: { $nin: [BookingStatus.Cancelled] },
      deletedAt: null,
    }).lean();

    const stats = rooms.map((room) => {
      const roomBookings = bookings.filter((b) => b.roomId?.toString() === room._id.toString());
      return {
        roomId: room._id,
        roomName: room.name,
        totalBookings: roomBookings.length,
        confirmedBookings: roomBookings.filter((b) => b.status === BookingStatus.Confirmed || b.status === BookingStatus.Completed).length,
      };
    });

    return {
      totalBookings: bookings.length,
      confirmedBookings: bookings.filter((b) => b.status === BookingStatus.Confirmed || b.status === BookingStatus.Completed).length,
      byRoom: stats,
    };
  },

  async getTodayStats() {
    const today = new Date().toISOString().split("T")[0];
    const bookings = await BookingModel.find({
      date: today,
      deletedAt: null,
    }).populate("roomId", "name capacity").lean();

    const confirmed = bookings.filter((b) => b.status === BookingStatus.Confirmed || b.status === BookingStatus.Completed);
    const pending = bookings.filter((b) => b.status === BookingStatus.Pending);
    const cancelled = bookings.filter((b) => b.status === BookingStatus.Cancelled);

    const rooms = await RoomModel.find({ isActive: true, deletedAt: null }).lean();
    const roomsInUse = new Set(confirmed.map((b) => b.roomId?.toString())).size;

    return {
      total: bookings.length,
      confirmed: confirmed.length,
      pending: pending.length,
      cancelled: cancelled.length,
      roomsInUse,
      totalRooms: rooms.length,
    };
  },
};

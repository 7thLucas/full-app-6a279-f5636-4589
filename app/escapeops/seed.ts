import { createLogger } from "~/lib/logger";
import { RoomModel } from "./rooms/api/room.model";
import { PuzzleModel, PuzzleStatus } from "./puzzles/api/puzzle.model";
import { ShiftModel, ShiftRole, ShiftStatus } from "./schedule/api/shift.model";
import { BookingModel, BookingStatus } from "./bookings/api/booking.model";
import crypto from "node:crypto";

const logger = createLogger("EscapeOpsSeed");

function generateBookingRef(): string {
  return "EO-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function dateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

export async function seedEscapeOps(): Promise<void> {
  try {
    logger.info("Seeding EscapeOps demo data...");

    // ── Rooms ──────────────────────────────────────────────────────────────
    const existingRooms = await RoomModel.countDocuments({ deletedAt: null });
    let rooms: any[] = [];

    if (existingRooms === 0) {
      rooms = await RoomModel.insertMany([
        { name: "The Alchemist's Lab", theme: "Victorian science mystery", description: "A brilliant alchemist's study filled with cryptic formulas and arcane devices.", capacity: 6, difficultyRating: 3, sessionDurationMinutes: 60, color: "#4F46E5", isActive: true },
        { name: "The Vault", theme: "High-stakes bank heist", description: "Crack the vault before the security re-engages. Every second counts.", capacity: 8, difficultyRating: 4, sessionDurationMinutes: 75, color: "#059669", isActive: true },
        { name: "Lost Jungle Temple", theme: "Archaeological adventure", description: "Ancient traps and riddles guard the temple's secrets.", capacity: 6, difficultyRating: 2, sessionDurationMinutes: 60, color: "#D97706", isActive: true },
      ]);
      logger.info(`Seeded ${rooms.length} rooms`);
    } else {
      rooms = await RoomModel.find({ deletedAt: null }).lean();
      logger.info("Rooms already exist, skipping");
    }

    // ── Puzzles ────────────────────────────────────────────────────────────
    const existingPuzzles = await PuzzleModel.countDocuments({ deletedAt: null });
    if (existingPuzzles === 0 && rooms.length > 0) {
      const now = new Date();
      const old30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const old60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      await PuzzleModel.insertMany([
        // Alchemist's Lab puzzles
        { roomId: rooms[0]._id, name: "Element Cipher", description: "Decode the periodic table symbols to reveal the formula.", difficultyRating: 3, status: PuzzleStatus.Active, playCount: 45, lastRefreshedAt: old30, freshnessScore: 55, needsRefresh: false },
        { roomId: rooms[0]._id, name: "Flask Color Sequence", description: "Fill the flasks in the correct order using color logic.", difficultyRating: 2, status: PuzzleStatus.Active, playCount: 62, lastRefreshedAt: old60, freshnessScore: 28, needsRefresh: true },
        { roomId: rooms[0]._id, name: "Astrolabe Lock", description: "Align the astrolabe to the correct celestial position.", difficultyRating: 4, status: PuzzleStatus.UnderRepair, playCount: 30, lastRefreshedAt: now, freshnessScore: 90, needsRefresh: false },
        // The Vault puzzles
        { roomId: rooms[1]._id, name: "Combination Dial", description: "Decode the three-number combination from the security footage.", difficultyRating: 3, status: PuzzleStatus.Active, playCount: 88, lastRefreshedAt: old30, freshnessScore: 42, needsRefresh: true },
        { roomId: rooms[1]._id, name: "Blueprint Maze", description: "Navigate the vault blueprint to find the hidden passage.", difficultyRating: 4, status: PuzzleStatus.Active, playCount: 55, lastRefreshedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), freshnessScore: 72, needsRefresh: false },
        { roomId: rooms[1]._id, name: "Security Keypad", description: "Brute-force the keypad using clues hidden around the room.", difficultyRating: 3, status: PuzzleStatus.Active, playCount: 70, lastRefreshedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), freshnessScore: 80, needsRefresh: false },
        // Lost Jungle Temple puzzles
        { roomId: rooms[2]._id, name: "Stone Glyph Panel", description: "Match the ancient glyphs in the correct sequence.", difficultyRating: 2, status: PuzzleStatus.Active, playCount: 40, lastRefreshedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), freshnessScore: 85, needsRefresh: false },
        { roomId: rooms[2]._id, name: "Idol Pressure Plates", description: "Stand on the correct pressure plates to deactivate the traps.", difficultyRating: 2, status: PuzzleStatus.Active, playCount: 28, lastRefreshedAt: now, freshnessScore: 95, needsRefresh: false },
      ]);
      logger.info("Seeded 8 puzzles");
    }

    // ── Shifts (today + next 7 days) ───────────────────────────────────────
    const existingShifts = await ShiftModel.countDocuments({ deletedAt: null });
    if (existingShifts === 0 && rooms.length >= 3) {
      const shifts = [];
      for (let day = 0; day <= 6; day++) {
        const date = dateStr(day);
        shifts.push(
          { staffId: "gm-001", staffName: "Alex Rivera", role: ShiftRole.GameMaster, date, startTime: "10:00", endTime: "18:00", roomId: rooms[0]._id, status: ShiftStatus.Confirmed, notes: "" },
          { staffId: "gm-002", staffName: "Jordan Kim", role: ShiftRole.GameMaster, date, startTime: "12:00", endTime: "20:00", roomId: rooms[1]._id, status: ShiftStatus.Confirmed, notes: "" },
          { staffId: "gm-003", staffName: "Sam Torres", role: ShiftRole.GameMaster, date, startTime: "14:00", endTime: "22:00", roomId: rooms[2]._id, status: ShiftStatus.Confirmed, notes: "" },
          { staffId: "mgr-001", staffName: "Morgan Lee", role: ShiftRole.Manager, date, startTime: "09:00", endTime: "17:00", status: ShiftStatus.Confirmed, notes: "" },
        );
      }
      await ShiftModel.insertMany(shifts);
      logger.info(`Seeded ${shifts.length} shifts`);
    }

    // ── Bookings (today + next 3 days) ─────────────────────────────────────
    const existingBookings = await BookingModel.countDocuments({ deletedAt: null });
    if (existingBookings === 0 && rooms.length >= 3) {
      const timeSlots = [
        { start: "10:00", end: "11:00" },
        { start: "11:30", end: "12:30" },
        { start: "13:00", end: "14:00" },
        { start: "14:30", end: "15:30" },
        { start: "16:00", end: "17:00" },
        { start: "17:30", end: "18:30" },
        { start: "19:00", end: "20:00" },
      ];

      const customers = [
        { name: "Sophia Chen", email: "sophia@example.com", phone: "555-0101" },
        { name: "Marcus Wright", email: "marcus@example.com", phone: "555-0102" },
        { name: "Emma Johnson", email: "emma@example.com", phone: "555-0103" },
        { name: "Liam Patel", email: "liam@example.com", phone: "555-0104" },
        { name: "Olivia Nguyen", email: "olivia@example.com", phone: "555-0105" },
        { name: "Noah Garcia", email: "noah@example.com", phone: "555-0106" },
        { name: "Ava Thompson", email: "ava@example.com", phone: "555-0107" },
        { name: "Ethan Davis", email: "ethan@example.com", phone: "555-0108" },
        { name: "Isabella Wilson", email: "isabella@example.com", phone: "555-0109" },
        { name: "Mia Martinez", email: "mia@example.com", phone: "555-0110" },
      ];

      const bookings = [];
      let ci = 0;
      for (let day = 0; day <= 3; day++) {
        const date = dateStr(day);
        // Fill ~70% of slots
        const slotsToBook = Math.floor(timeSlots.length * 0.7);
        for (let i = 0; i < slotsToBook; i++) {
          const slot = timeSlots[i];
          const customer = customers[ci % customers.length];
          ci++;
          const roomIdx = Math.floor(Math.random() * rooms.length);
          bookings.push({
            roomId: rooms[roomIdx]._id,
            date,
            startTime: slot.start,
            endTime: slot.end,
            customerName: customer.name,
            customerEmail: customer.email,
            customerPhone: customer.phone,
            groupSize: Math.floor(Math.random() * 4) + 2,
            status: day === 0 ? BookingStatus.Confirmed : (Math.random() > 0.2 ? BookingStatus.Confirmed : BookingStatus.Pending),
            notes: "",
            bookingRef: generateBookingRef(),
            isWaitlisted: false,
          });
        }
      }
      await BookingModel.insertMany(bookings);
      logger.info(`Seeded ${bookings.length} bookings`);
    }

    logger.info("EscapeOps demo data seeded successfully");
  } catch (error) {
    logger.error("Failed to seed EscapeOps data:", error);
  }
}

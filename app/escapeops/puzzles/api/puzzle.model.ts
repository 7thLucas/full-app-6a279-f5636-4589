import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Room } from "~/escapeops/rooms/api/room.model";

export enum PuzzleStatus {
  Active = "active",
  UnderRepair = "under_repair",
  Retired = "retired",
}

export interface MaintenanceLogEntry {
  date: string;
  technician: string;
  action: string;
  notes: string;
  createdAt: string;
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_puzzles",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Puzzle extends CommonTypegooseEntity {
  @prop({ ref: () => Room, required: true })
  roomId!: Ref<Room>;

  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: false, default: "" })
  description!: string;

  @prop({ type: Number, required: false, default: 3, min: 1, max: 5 })
  difficultyRating!: number;

  @prop({ type: String, enum: PuzzleStatus, default: PuzzleStatus.Active })
  status!: PuzzleStatus;

  @prop({ type: Number, default: 0 })
  playCount!: number;

  @prop({ type: Date, required: false })
  lastRefreshedAt?: Date;

  @prop({ type: Boolean, default: false })
  needsRefresh!: boolean;

  @prop({ type: Number, default: 100 })
  freshnessScore!: number;

  @prop({ type: Array, default: [] })
  maintenanceLogs!: MaintenanceLogEntry[];

  @prop({ type: Array, default: [] })
  sessionNotes!: { date: string; gameMaster: string; note: string; createdAt: string }[];
}

export const PuzzleModel = getModelForClass(Puzzle);

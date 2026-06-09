import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Room } from "~/escapeops/rooms/api/room.model";

export enum ShiftRole {
  Owner = "owner",
  Manager = "manager",
  GameMaster = "game_master",
}

export enum ShiftStatus {
  Scheduled = "scheduled",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  Completed = "completed",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_shifts",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Shift extends CommonTypegooseEntity {
  @prop({ type: String, required: true })
  staffId!: string;

  @prop({ type: String, required: true })
  staffName!: string;

  @prop({ type: String, enum: ShiftRole, required: true })
  role!: ShiftRole;

  @prop({ type: String, required: true })
  date!: string;

  @prop({ type: String, required: true })
  startTime!: string;

  @prop({ type: String, required: true })
  endTime!: string;

  @prop({ ref: () => Room, required: false })
  roomId?: Ref<Room>;

  @prop({ type: String, enum: ShiftStatus, default: ShiftStatus.Scheduled })
  status!: ShiftStatus;

  @prop({ type: String, required: false, default: "" })
  notes!: string;
}

export const ShiftModel = getModelForClass(Shift);

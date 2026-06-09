import { prop, getModelForClass, modelOptions, Ref } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";
import { Room } from "~/escapeops/rooms/api/room.model";

export enum BookingStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  NoShow = "no_show",
  Completed = "completed",
}

@modelOptions({
  schemaOptions: {
    collection: "tbl_bookings",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Booking extends CommonTypegooseEntity {
  @prop({ ref: () => Room, required: true })
  roomId!: Ref<Room>;

  /** ISO date string for the booking day: YYYY-MM-DD */
  @prop({ type: String, required: true })
  date!: string;

  /** 24h time string: HH:MM */
  @prop({ type: String, required: true })
  startTime!: string;

  /** 24h time string: HH:MM */
  @prop({ type: String, required: true })
  endTime!: string;

  @prop({ type: String, required: true, trim: true })
  customerName!: string;

  @prop({ type: String, required: false, default: "" })
  customerEmail!: string;

  @prop({ type: String, required: false, default: "" })
  customerPhone!: string;

  @prop({ type: Number, required: true, min: 1 })
  groupSize!: number;

  @prop({ type: String, enum: BookingStatus, default: BookingStatus.Pending })
  status!: BookingStatus;

  @prop({ type: String, required: false, default: "" })
  notes!: string;

  /** Unique booking reference */
  @prop({ type: String, required: true, unique: true })
  bookingRef!: string;

  /** Whether this is on the waitlist */
  @prop({ type: Boolean, default: false })
  isWaitlisted!: boolean;
}

export const BookingModel = getModelForClass(Booking);

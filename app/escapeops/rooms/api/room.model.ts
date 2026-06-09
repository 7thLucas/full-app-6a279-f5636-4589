import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

@modelOptions({
  schemaOptions: {
    collection: "tbl_rooms",
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  },
})
export class Room extends CommonTypegooseEntity {
  @prop({ type: String, required: true, trim: true })
  name!: string;

  @prop({ type: String, required: false, default: "" })
  theme!: string;

  @prop({ type: String, required: false, default: "" })
  description!: string;

  @prop({ type: Number, required: true, default: 6 })
  capacity!: number;

  @prop({ type: Number, required: false, default: 3, min: 1, max: 5 })
  difficultyRating!: number;

  /** Duration of each session in minutes */
  @prop({ type: Number, required: false, default: 60 })
  sessionDurationMinutes!: number;

  @prop({ type: Boolean, default: true })
  isActive!: boolean;

  /** Hex color for calendar display */
  @prop({ type: String, required: false, default: "#4F46E5" })
  color!: string;
}

export const RoomModel = getModelForClass(Room);

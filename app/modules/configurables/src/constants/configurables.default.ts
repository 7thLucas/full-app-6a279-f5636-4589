/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TRoomConfig = {
  name: string;
  theme: string;
  capacity: number;
  difficultyRating: number;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  tagline: string;
  brandColor: TBrandColor;
  businessName: string;
  contactEmail: string;
  defaultSessionDurationMinutes: number;
  bookingSlotIntervalMinutes: number;
  puzzleFreshnessThresholdDays: number;
  maxGroupSize: number;
  enableWaitlist: boolean;
  enableEmailNotifications: boolean;
  dashboardWelcomeMessage: string;
  rooms: TRoomConfig[];
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "EscapeOps",
  logoUrl: "FILL_LOGO_URL_HERE",
  tagline: "Run your rooms. Own your ops.",
  brandColor: {
    primary: "#4F46E5",
    secondary: "#1e293b",
    accent: "#F59E0B",
  },
  businessName: "EscapeOps Venue", // fill it here
  contactEmail: "ops@escapeops.com", // fill it here
  defaultSessionDurationMinutes: 60, // fill it here
  bookingSlotIntervalMinutes: 30, // fill it here
  puzzleFreshnessThresholdDays: 30, // fill it here
  maxGroupSize: 8, // fill it here
  enableWaitlist: true, // fill it here
  enableEmailNotifications: true, // fill it here
  dashboardWelcomeMessage: "Welcome back. Here's your ops overview.", // fill it here
  rooms: [
    { name: "The Alchemist's Lab", theme: "Victorian science mystery", capacity: 6, difficultyRating: 3 },
    { name: "The Vault", theme: "High-stakes bank heist", capacity: 8, difficultyRating: 4 },
    { name: "Lost Jungle Temple", theme: "Archaeological adventure", capacity: 6, difficultyRating: 2 },
  ], // fill it here
};

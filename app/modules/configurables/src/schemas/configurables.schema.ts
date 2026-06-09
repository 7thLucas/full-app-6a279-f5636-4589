/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "tagline",
      type: "string",
      required: false,
      label: "Tagline",
      maxLength: 100,
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "businessName",
      type: "string",
      required: false,
      label: "Business Name",
      maxLength: 100,
    },
    {
      fieldName: "contactEmail",
      type: "string",
      required: false,
      label: "Contact Email",
      maxLength: 100,
    },
    {
      fieldName: "defaultSessionDurationMinutes",
      type: "number",
      required: false,
      label: "Default Session Duration (minutes)",
      min: 30,
      max: 240,
    },
    {
      fieldName: "bookingSlotIntervalMinutes",
      type: "number",
      required: false,
      label: "Booking Slot Interval (minutes)",
      min: 15,
      max: 120,
    },
    {
      fieldName: "puzzleFreshnessThresholdDays",
      type: "number",
      required: false,
      label: "Puzzle Freshness Alert Threshold (days)",
      min: 7,
      max: 365,
    },
    {
      fieldName: "maxGroupSize",
      type: "number",
      required: false,
      label: "Default Max Group Size",
      min: 1,
      max: 30,
    },
    {
      fieldName: "enableWaitlist",
      type: "boolean",
      required: false,
      label: "Enable Waitlist for Fully Booked Slots",
    },
    {
      fieldName: "enableEmailNotifications",
      type: "boolean",
      required: false,
      label: "Enable Email Notifications",
    },
    {
      fieldName: "dashboardWelcomeMessage",
      type: "string",
      required: false,
      label: "Dashboard Welcome Message",
      maxLength: 200,
    },
    {
      fieldName: "rooms",
      type: "array",
      label: "Room List",
      item: {
        type: "object",
        fields: [
          { fieldName: "name", type: "string", required: true, label: "Room Name" },
          { fieldName: "theme", type: "string", required: false, label: "Theme / Description" },
          { fieldName: "capacity", type: "number", required: true, label: "Max Capacity" },
          { fieldName: "difficultyRating", type: "number", required: false, label: "Difficulty (1-5)" },
        ],
      },
    },
  ],
};

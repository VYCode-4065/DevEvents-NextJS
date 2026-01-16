import mongoose, { Document, Schema, Model } from "mongoose";

// TypeScript interface for Event document
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO format
  time: string; // HH:mm format
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema definition
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
    },
    overview: {
      type: String,
      required: [true, "Overview is required"],
      minlength: [10, "Overview must be at least 10 characters"],
    },
    image: {
      type: String,
      required: [true, "Event image is required"],
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    date: {
      type: String,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
    },
    mode: {
      type: String,
      enum: {
        values: ["online", "offline", "hybrid"],
        message: "Mode must be either 'online', 'offline', or 'hybrid'",
      },
      required: [true, "Event mode is required"],
    },
    audience: {
      type: String,
      required: [true, "Target audience is required"],
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: [
        (v: string[]) => Array.isArray(v) && v.length > 0,
        "Agenda must contain at least one item",
      ],
    },
    organizer: {
      type: String,
      required: [true, "Organizer name is required"],
    },
    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: [
        (v: string[]) => Array.isArray(v) && v.length > 0,
        "Tags must contain at least one item",
      ],
    },
  },
  { timestamps: true }
);

// Pre-save hook: generate slug from title and normalize date/time
eventSchema.pre<IEvent>("save", async function () {
  // Generate slug from title only if title is new or modified
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^\w-]/g, "") // Remove special characters
      .replace(/-+/g, "-"); // Remove consecutive hyphens
  }

  // Normalize date to ISO format (YYYY-MM-DD)
  if (this.isModified("date")) {
    try {
      const dateObj = new Date(this.date);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date format");
      }
      this.date = dateObj.toISOString().split("T")[0];
    } catch {
      throw new Error("Date must be a valid date string");
    }
  }

  // Normalize time to HH:mm format
  if (this.isModified("time")) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(this.time)) {
      throw new Error("Time must be in HH:mm format (24-hour)");
    }
  }
});

// Create and export the Event model
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;

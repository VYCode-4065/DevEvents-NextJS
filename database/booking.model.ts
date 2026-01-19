import mongoose, { Document, Schema, Model } from "mongoose";
import Event from "./event.model";

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema definition
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      required:true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v: string) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email format",
      },
    },
  },
  { timestamps: true }
);

// Index on eventId for faster queries
bookingSchema.index({ eventId: 1 });

// Pre-save hook: verify referenced event exists and validate email format
bookingSchema.pre<IBooking>("save", async function () {
  // Verify the referenced event exists in the database
  if (this.isModified("eventId")) {
    try {
      const eventExists = await Event.findById(this.eventId);
      if (!eventExists) {
        throw new Error("Referenced event does not exist");
      }
    } catch (error) {
      throw new Error(
        "Error validating event reference: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }

  // Validate email format (additional layer of validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(this.email)) {
    throw new Error("Invalid email format");
  }
});

// Create and export the Booking model
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;

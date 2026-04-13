const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    }, // Reference to hotel

    number: { type: String, required: true }, // Room number
    type: {
      type: String,
      enum: ["Single", "Double", "Suite"],
      required: true,
    }, // Room type
     capacity: {
      adults: { type: Number, required: true },   // max adults
      children: { type: Number, default: 0 }      // max children
    },
    
    extraGuestAllowed: { type: Boolean, default: false },
    price: { type: Number, required: true }, // Price per night
    description: { type: String }, // Optional description
    amenities: [{ type: String }], // e.g., WiFi, AC, TV
    images: [{ type: String }], // URLs for room images
    isAvailable: { type: Boolean, default: true }, // Quick availability check
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to the owner (hotel manager)
  },
  { timestamps: true },
);

roomSchema.index({ hotel: 1, number: 1 }, { unique: true });
const Room = mongoose.model("Room", roomSchema);

module.exports = Room;

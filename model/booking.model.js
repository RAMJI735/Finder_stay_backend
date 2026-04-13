const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  // 👤 User & Hotel Info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },

  // 📅 Booking Dates
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },

  nights: Number,

  // 👥 Guests
  guests: {
    adults: Number,
    children: Number
  },

  // 💰 PRICE LOCK SYSTEM (MOST IMPORTANT 🔥)
  priceBreakup: {
    roomPrice: Number,
    taxes: Number,
    extraGuestCharge: Number,
    discount: Number,
    finalPrice: Number
  },

  lockedPrice: {
    type: Number,
    required: true
  },

  currency: {
    type: String,
    default: "INR"
  },

  // 🏨 HOTEL CONFIRMATION SYSTEM (VERY IMPORTANT)
  bookingStatus: {
    type: String,
    enum: [
      "pending",          // user requested
      "hotel_accepted",   // hotel approved
      "confirmed",        // payment done
      "rejected",         // hotel denied
      "cancelled",
      "completed",
      "auto_cancelled"
    ],
    default: "pending"
  },

  hotelAcceptance: {
    accepted: {
      type: Boolean,
      default: false
    },
    acceptedPrice: Number,
    acceptedAt: Date,
    rejectedReason: String
  },

  // 💳 Payment Info
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending"
  },

  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  },

  paymentMethod: {
    type: String,
    enum: ["razorpay", "upi", "card", "cash"]
  },



  // 📄 Voucher / Proof
  bookingCode: {
    type: String,
    unique: true
  },

  // 🚨 Issue Handling
  hasIssue: {
    type: Boolean,
    default: false
  },

  issueStatus: {
    type: String,
    enum: ["none", "reported", "resolved"],
    default: "none"
  },

  // 🧠 Metadata
  bookingSource: {
    type: String,
    enum: ["app", "web", "admin"],
    default: "app"
  },

  specialRequests: String

}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
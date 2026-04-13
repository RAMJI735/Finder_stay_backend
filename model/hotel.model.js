const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },               // Hotel name
  address: { type: String, required: true },            // Full address
  city: { type: String, required: true },               // City
  state: { type: String },                              
  country: { type: String, required: true },           // Country
  phone: { type: String },                              
  email: { type: String },                              
  website: { type: String },                            
  rating: { type: Number, min: 0, max: 5, default: 0 }, // Average rating
  description: { type: String },                        // Short description
  amenities: [{ type: String }],                        // e.g., "Pool", "WiFi"
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }], // Optional relation
  images: [{ type: String }],
  owner: {type:mongoose.Schema.Types.ObjectId, ref: 'User'},
  location: {
  type: { type: String, enum: ['Point'], default: 'Point' },
  coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
},
  policySnapshot:{
  checkInTime: { type: String, default: Date.now() },
  checkOutTime: { type: String, default: Date.now() },
  earlyCheckInAllowed: { type: Boolean, default: true },
  earlyCheckInCharge: { type: Number, default: 300 },
  lateCheckOutAllowed: { type: Boolean, default: true },
  lateCheckOutCharge: { type: Number, default: 400 },
  idProofRequired: { type: Boolean, default: true },
  localIdAllowed: { type: Boolean, default: false }
}                           // URLs to hotel images

},{timestamps:true});

hotelSchema.index({ location: '2dsphere' });
hotelSchema.index(
  { name: 1, city: 1, owner: 1 },
  { unique: true }
);
const Hotel = mongoose.model('Hotel', hotelSchema);
module.exports = Hotel;
const mongoose = require("mongoose");

const emailotpschema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    otp: Number,
    expiresat: Date,
    isverified: { type: Boolean, default: false },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("emailotp", emailotpschema);

const mongoose = require("mongoose");

/* ================= TYPE LEVEL ================= */
const navbartypeschema = new mongoose.Schema({
  title: String,                // Sports Bra, Everyday Bra
  slug: String,

  image: String,                // Cloudinary image

  badge: String,                // HOT, NEW, 90% OFF

  extra: mongoose.Schema.Types.Mixed, 
  // 🔥 admin can add ANYTHING later (discount, icon, etc.)

  isactive: {
    type: Boolean,
    default: true
  }
});

/* ================= SUB CATEGORY ================= */
const navbarsubcategoryschema = new mongoose.Schema({
  title: String,                // Women Bra
  slug: String,

  image: String,                // Cloudinary image

  position: Number,

  types: [navbartypeschema],

  extra: mongoose.Schema.Types.Mixed,

  isactive: {
    type: Boolean,
    default: true
  }
});

/* ================= MAIN CATEGORY ================= */
const navbarmaincategoryschema = new mongoose.Schema({
  title: String,                // Womens Fashion
  slug: String,

  image: String,                // Cloudinary image
  icon: String,

  position: Number,

  subcategories: [navbarsubcategoryschema],

  extra: mongoose.Schema.Types.Mixed,

  isactive: {
    type: Boolean,
    default: true
  }
});

/* ================= NAVBAR ROOT ================= */
const navbarschema = new mongoose.Schema(
  {
    theme: {
      background: String,        // "#020617"
      text: String,              // "#ffffff"
      hover: String,             // "#3b82f6"
      border: String,            // optional
      gradient: String           // optional
    },

    extras: [
      {
        title: String,           // "90% SALE"
        color: String,
        link: String,
        badge: String,
        isactive: Boolean
      }
    ],

    categories: [navbarmaincategoryschema],

    isactive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Navbar", navbarschema);

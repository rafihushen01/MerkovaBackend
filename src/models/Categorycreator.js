const mongoose = require("mongoose");

// ================= SUB CATEGORY =================
const subcategoryschema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    slug: { type: String, lowercase: true },
    image: String,
       navigatelink: String,
    serial: { type: Number, default: 0 },
    isactive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// ================= BRAND =================
const brandschema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    slug: { type: String, lowercase: true },
    image: String,
     navigatelink: String,
    isactive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// ================= MATERIAL =================
const materialschema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
     navigatelink: String,
    isactive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// ================= MAIN CATEGORY =================
const categoryschema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    slug: { type: String, lowercase: true, index: true },
    image: String,
    navigatelink: String,
    serial: { type: Number, default: 0 },
    isactive: { type: Boolean, default: true },

    subcategories: [subcategoryschema],
    brands: [brandschema],
    materials: [materialschema],

    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categoryschema);
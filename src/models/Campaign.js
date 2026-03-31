const mongoose = require("mongoose");

const campaignsectionschema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },

    image: {
      url: { type: String },
    },

    navlink: { type: String, trim: true },

    position: { type: Number, default: 0 },
    isactive: { type: Boolean, default: true },
  },
  { _id: false }
);

const campaignschema = new mongoose.Schema(
  {
    name: { type: String, trim: true },

    banner: {
      url: { type: String },
    },

    title: { type: String, trim: true },

    navlink: { type: String, trim: true },

    sections: [campaignsectionschema],

    startdate: { type: Date },
    enddate: { type: Date },

    isactive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("campaign", campaignschema);

const mongoose = require("mongoose");

const homebannerschema = new mongoose.Schema(
  {
   navigationlink:{

    type:String
   },

    images: [
      {
        path: { type: String }, // LOCAL FILE PATH
        position: { type: Number, default: 0 },
      },
    ],

    isactive: {
      type: Boolean,
      default: true,
    },

    createdby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homebanner", homebannerschema);

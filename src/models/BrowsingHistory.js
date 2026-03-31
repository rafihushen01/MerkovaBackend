const mongoose = require("mongoose");

// ==================== Browsing History Schema ====================
const browsingHistorySchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    
  },
  itemid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    index: true,
   
  },

  // session grouping
  sessionid: { type: String, index: true },

  // timestamps
  firstViewedAt: { type: Date, default: Date.now },
  lastViewedAt: { type: Date, default: Date.now },

  // raw metrics
  totalViewCount: { type: Number, default: 1 },
  totalViewDuration: { type: Number, default: 0 }, // total seconds

  // detailed interaction signals
  scrollDepthAvg: { type: Number, default: 0 },
  imageZooms: { type: Number, default: 0 },
  videoPlays: { type: Number, default: 0 },
  specsOpened: { type: Boolean, default: false },
  reviewsOpened: { type: Boolean, default: false },
  sellerClicked: { type: Boolean, default: false },

  // conversion signals
  addedToCart: { type: Boolean, default: false },
  wishlisted: { type: Boolean, default: false },

  // computed score
  attentionScore: { type: Number, default: 0 }

}, { timestamps: true });

// compound indexes for fast query
browsingHistorySchema.index({ userid: 1, lastViewedAt: -1 });
browsingHistorySchema.index({ itemid: 1, attentionScore: -1 });

module.exports = mongoose.model("BrowsingHistory", browsingHistorySchema);

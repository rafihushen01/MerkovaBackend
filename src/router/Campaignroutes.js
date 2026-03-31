const express = require("express");
const router = express.Router();
const upload = require("../middlewares/Multer.js");
const {
  createcampaign,
  addcampaignsection,
  getactivecampaigns,
    deletecampaign,
} = require("../controller/Campaigncontroller");

// ADMIN
router.post("/admin/campaign", upload.single("banner"), createcampaign);
router.post("/admin/campaign/:id/section", upload.single("image"), addcampaignsection);
router.delete("/admin/campaign/:id", deletecampaign);
// FRONTEND
router.get("/active", getactivecampaigns);

module.exports = router;

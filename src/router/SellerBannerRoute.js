const express = require("express");
const upload = require("../middlewares/Multer");
const router = express.Router();
const {
  createhomebanner,
  gethomebanners,
  updatehomebanner,
  
reorderbannerimages,

  
  deletehomebanner,
} = require("../controller/SellerHomeBannerController.js");

router.post("/create", upload.array("images", 14), createhomebanner);
router.get("/", gethomebanners);
router.put("/:bannerid", updatehomebanner);
router.put("/reorder/:bannerid", reorderbannerimages);


router.delete("/:bannerid", deletehomebanner);

module.exports = router;

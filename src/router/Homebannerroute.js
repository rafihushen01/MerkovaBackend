const express = require("express");
const upload = require("../middlewares/Multer");
const router = express.Router();
const {
  createhomebanner,
  gethomebanners,
  updatehomebanner,
  addbannerimages,
  updatebannerimage,
  deletebannerimage,
  reorderbannerimages,
  deletehomebanner,
} = require("../controller/Homebannercontroller.js");

router.post("/create", upload.array("images", 14), createhomebanner);
router.get("/", gethomebanners);
router.put("/:bannerid", updatehomebanner);
router.put("/add-images/:bannerid", upload.array("images", 14), addbannerimages);
router.put("/image/:bannerid/:imageid", upload.single("image"), updatebannerimage);
router.delete("/image/:bannerid/:imageid", deletebannerimage);
router.put("/reorder/:bannerid", reorderbannerimages);
router.delete("/:bannerid", deletehomebanner);

module.exports = router;

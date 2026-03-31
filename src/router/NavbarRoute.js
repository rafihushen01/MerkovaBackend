const express = require("express");
const router = express.Router();

const upload = require("../middlewares/Multer");
const verifytoken = require("../middlewares/IsAuth");


const {
  savenavbar,
  uploadnavbarimage,
  getnavbar
} = require("../controller/NavbarController");

// ADMIN – upload image for ANY navbar level
router.post(
  "/admin/upload-image",
  verifytoken,
  
  upload.single("image"),
  uploadnavbarimage
);

// ADMIN – create/update navbar config
router.post(
  "/admin/save",
  verifytoken,
  
  savenavbar
);

// PUBLIC – get navbar
router.get("/public", getnavbar);

module.exports = router;

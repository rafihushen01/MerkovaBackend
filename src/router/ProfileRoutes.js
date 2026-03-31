const express = require("express");
const upload = require("../middlewares/Multer");
const isauth = require("../middlewares/IsAuth");
const { getprofile, updateprofile, updateavatar } = require("../controller/ProfileController");

const router = express.Router();

router.get("/", isauth, getprofile);
router.put("/update", isauth, updateprofile);

// ⚡ POST instead of PUT for avatar
router.post("/avatar", isauth, upload.single("avatar"), updateavatar);

module.exports = router;

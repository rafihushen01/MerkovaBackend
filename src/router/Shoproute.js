const express = require("express");
const router = express.Router();

const upload = require("../middlewares/Multer");
const verifytoken = require("../middlewares/IsAuth");
const {
  createShop,
  verifyShopCode,
  getCurrentShopOwner,editShop,
  followShop,
  unfollowShop
} = require("../controller/ShopController");

// ================= ADMIN CREATE SHOP =================
router.post(
  "/create",
  // verifytoken, // enable in production
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "profileimage", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },

    { name: "nid", maxCount: 1 },
    { name: "birthcertificate", maxCount: 1 },
    { name: "physicalstoreimage", maxCount: 1 },
    { name: "tradelicense", maxCount: 1 },

    { name: "gallery", maxCount: 10 }, // optional
    { name: "video", maxCount: 1 },    // optional
  ]),
  createShop
);

// ================= VERIFY SHOP CODE (SELLER) =================
router.post("/verify-shopcode",verifytoken, verifyShopCode);
router.get("/getcurrentshop", verifytoken, getCurrentShopOwner);
router.put(
  "/editshop",
  verifytoken,
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "profileimage", maxCount: 1 },
    { name: "coverimage", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  editShop
);
router.post(
  
  "/follow",
  verifytoken,
 followShop



)
router.post(
  
  "/unfollow",
  verifytoken,
 unfollowShop



)

module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../middlewares/Multer"); // your multer module
const {
  createShopRequest,
  getAllShopRequests,
  updateShopRequestStatus,
  deleteShopRequest
} = require("../controller/ShopRequestController");

// ================= ROUTES =================
router.post(
  "/create",
  upload.fields([
    { name: "nidfrontimage", maxCount: 1 },
    { name: "nidbackimage", maxCount: 1 },
    { name: "birthCertificateImage", maxCount: 1 },
    { name: "profileImage", maxCount: 1 },
    { name: "shopThumbnail", maxCount: 1 },
    { name: "physicalStoreImage", maxCount: 1 },
    { name: "bankcheckbookimage", maxCount: 1 },
    { name: "additionalDocuments", maxCount: 10 }
  ]),
  createShopRequest
);


// Admin fetch all shop requests
router.get("/all", getAllShopRequests);

// Admin approve/reject shop requests
router.patch("/update-status/:requestId", updateShopRequestStatus);
router.delete("/delete/:requestId", deleteShopRequest);
module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../middlewares/Multer");
const verifytoken = require("../middlewares/IsAuth");

const {
  createitem,
  edititem,
  getmyshopitems,
  deletevariant,
  deleteitem,
  getrelateditems,
  // ===== NEW HEAD OFFICE CONTROLLERS =====
  getallitemsforheadoffice,
  getitemsbycategory,
  getjustforyouitems,
  getglobalitembyid,
  getshopbyid
} = require("../controller/ItemController");

// ================= CREATE ITEM =================
router.post(
  "/create",
  verifytoken,
  upload.any(), // dynamic color fields
  createitem
);

// ================= EDIT ITEM =================
router.patch(
  "/edit/:itemid",
  verifytoken,
  upload.any(), // required for color-wise uploads
  edititem
);

// ================= GET ITEMS OF MY SHOP =================
router.post(
  "/myshop",
  verifytoken,
  getmyshopitems
);

// ================= DELETE VARIANT =================
router.delete(
  "/variant/:itemid/:colorname",
  verifytoken,
  deletevariant
);

// ================= DELETE FULL ITEM =================
router.delete(
  "/delete/:itemid",
  verifytoken,
  deleteitem
);

router.get("/related/:itemid", getrelateditems);

// ================= HEAD OFFICE / SUPERADMIN ROUTES =================

// Get ALL items across all shops, categorized
router.get(
  "/headoffice/all",
  verifytoken, // ensure only superadmin can access (can enhance later)
  getallitemsforheadoffice
);

// Get items by category (optional subcategory filter)
router.get(
  "/headoffice/category",
  verifytoken,
  getitemsbycategory
);

// Get “Just for You” 5-star items
router.get(
  "/headoffice/justforyou",
  verifytoken,
  getjustforyouitems
);


router.get(
  "/itemdetails/:itemid",
 
getglobalitembyid
);
router.get(
  "/getshopbyid/:shopid",
 
getshopbyid
);
module.exports = router;

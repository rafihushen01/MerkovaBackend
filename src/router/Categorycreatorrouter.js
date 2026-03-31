const express = require("express");
const router = express.Router();

const upload = require("../middlewares/Multer");

// ================= CONTROLLERS =================
const {
  createcategory,
  addsubcategory,
  addbrand,
  addmaterial,
  editcategory,
  togglecategory,
  deletesubdocument,
  getallcategoriesadmin,
  getactivecategories
} = require("../controller/Categorycreatorcontroller");

// ================= MIDDLEWARES (OPTIONAL) =================
// const { isauthenticated, isadmin } = require("../middlewares/Auth");


// =======================================================
// 🟢 CREATE MAIN CATEGORY (ADMIN)
// =======================================================
router.post(
  "/create",
  // isauthenticated,
  // isadmin,
  upload.single("image"),
  createcategory
);


// =======================================================
// ➕ ADD SUB CATEGORY
// =======================================================
router.post(
  "/add-subcategory/:categoryid",
  // isauthenticated,
  // isadmin,
  upload.single("image"),
  addsubcategory
);


// =======================================================
// ➕ ADD BRAND
// =======================================================
router.post(
  "/add-brand/:categoryid",
  // isauthenticated,
  // isadmin,
  upload.single("image"),
  addbrand
);


// =======================================================
// ➕ ADD MATERIAL
// =======================================================
router.post(
  "/add-material/:categoryid",
  // isauthenticated,
  // isadmin,
  addmaterial
);


// =======================================================
// ✏️ EDIT CATEGORY (NAME / IMAGE / LINK / SERIAL / STATUS)
// =======================================================
router.put(
  "/edit/:categoryid",
  // isauthenticated,
  // isadmin,
  upload.single("image"),
  editcategory
);


// =======================================================
// 🔄 ACTIVATE / DEACTIVATE CATEGORY (SOFT DELETE)
// =======================================================
router.patch(
  "/toggle/:categoryid",
  // isauthenticated,
  // isadmin,
  togglecategory
);


// =======================================================
// 🗑️ DELETE SUBCATEGORY / BRAND / MATERIAL
// type = subcategory | brand | material
// =======================================================
router.delete(
  "/delete/:categoryid/:type/:subid",
  // isauthenticated,
  // isadmin,
  deletesubdocument
);


// =======================================================
// 📋 ADMIN – GET ALL CATEGORIES (FULL TREE)
// =======================================================
router.get(
  "/admin/all",
  // isauthenticated,
  // isadmin,
  getallcategoriesadmin
);


// =======================================================
// 🌍 USER – GET ACTIVE CATEGORIES ONLY
// =======================================================
router.get(
  "/active",
  getactivecategories
);

module.exports = router;

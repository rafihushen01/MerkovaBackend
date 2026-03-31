const Navbar = require("../models/Navbar");
const uploadoncloudinary = require("../utils/Cloudinary");

/* ================= CREATE / UPDATE NAVBAR ================= */
const savenavbar = async (req, res) => {
  try {
    let navbar = await Navbar.findOne();

 if (navbar) {
  navbar.theme = req.body.theme || navbar.theme;
  navbar.extras = req.body.extras || navbar.extras;

  // Merge instead of overwrite
  if (req.body.categories && req.body.categories.length > 0) {
    req.body.categories.forEach((newCat) => {
      const existingCatIndex = navbar.categories.findIndex(
        (c) => c.title === newCat.title
      );
      if (existingCatIndex > -1) {
        // Update existing category
        navbar.categories[existingCatIndex] = {
          ...navbar.categories[existingCatIndex]._doc,
          ...newCat,
          subcategories: newCat.sub || []
        };
      } else {
        // Add new category
        navbar.categories.push({
          ...newCat,
          subcategories: newCat.sub || []
        });
      }
    });
  }

  await navbar.save();
  return res.status(200).json({ success: true, message: "Navbar updated", navbar });
}

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= UPLOAD IMAGE (ANY LEVEL) ================= */
const uploadnavbarimage = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "Image required" });

    const url = await uploadoncloudinary(req.file.path);

    res.status(200).json({
      success: true,
      image: url
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET NAVBAR (PUBLIC) ================= */
const getnavbar = async (req, res) => {
  try {
    const navbar = await Navbar.findOne({ isactive: true }).lean();

    if (!navbar)
      return res.status(404).json({ success: false, message: "Navbar not found" });

    res.status(200).json({
      success: true,
      navbar
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  savenavbar,
  uploadnavbarimage,
  getnavbar
};

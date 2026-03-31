const Homebanner = require("../models/Homebanner");
const uploadoncloudinary = require("../utils/Cloudinary");

// =======================================================
// 🔹 CREATE HOME BANNER (WITH NAVIGATION LINK + IMAGES)
// =======================================================
const createhomebanner = async (req, res) => {
  try {
    const { navigationlink } = req.body;

    if (!navigationlink) {
      return res.status(400).json({
        success: false,
        message: "Navigation link is required",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one banner image is required",
      });
    }

    if (req.files.length > 8) {
      return res.status(400).json({
        success: false,
        message: "Maximum 8 banner images allowed",
      });
    }

    const images = [];

    for (let i = 0; i < req.files.length; i++) {
      const cloudurl = await uploadoncloudinary(req.files[i].path);

      images.push({
        path: cloudurl,
        position: i,
      });
    }

    const banner = await Homebanner.create({
      navigationlink,
      images,
      isactive: true,
      createdby: req.admin?._id,
    });

    res.status(201).json({
      success: true,
      message: "Home banner created successfully",
      banner,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================================================
// 🔹 GET HOME BANNERS (PUBLIC + SORTED + CLEAN RESPONSE)
// =======================================================
const gethomebanners = async (req, res) => {
  try {
    const banners = await Homebanner.find({
      $or: [{ isactive: true }, { isactive: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = banners.map((banner) => ({
      _id: banner._id,
      navigationlink: banner.navigationlink,
      isactive: banner.isactive,
      images: banner.images
        .sort((a, b) => a.position - b.position)
        .map((img) => ({
          _id: img._id,
          url: img.path,
          position: img.position,
        })),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================================================
// 🔹 UPDATE BANNER STATUS / NAVIGATION LINK
// =======================================================
const updatehomebanner = async (req, res) => {
  try {
    const { isactive, navigationlink } = req.body;

    const banner = await Homebanner.findById(req.params.bannerid);
    if (!banner)
      return res.status(404).json({ message: "Banner not found" });

    if (typeof isactive === "boolean") banner.isactive = isactive;
    if (navigationlink) banner.navigationlink = navigationlink;

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================================================
// 🔹 ADD IMAGES TO EXISTING BANNER
// =======================================================
const addbannerimages = async (req, res) => {
  try {
    const banner = await Homebanner.findById(req.params.bannerid);
    if (!banner)
      return res.status(404).json({ message: "Banner not found" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "Images required" });

    if (banner.images.length + req.files.length > 8)
      return res.status(400).json({ message: "Maximum 8 images allowed" });

    let position = banner.images.length;

    for (const file of req.files) {
      const cloudurl = await uploadoncloudinary(file.path);

      banner.images.push({
        path: cloudurl,
        position,
      });

      position++;
    }

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================================================
// 🔹 UPDATE SINGLE IMAGE
// =======================================================
const updatebannerimage = async (req, res) => {
  try {
    const banner = await Homebanner.findById(req.params.bannerid);
    if (!banner)
      return res.status(404).json({ message: "Banner not found" });

    if (!req.file)
      return res.status(400).json({ message: "Image file required" });

    const image = banner.images.id(req.params.imageid);
    if (!image)
      return res.status(404).json({ message: "Image not found" });

    const cloudurl = await uploadoncloudinary(req.file.path);
    image.path = cloudurl;

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================================================
// 🔹 DELETE SINGLE IMAGE (AUTO REORDER)
// =======================================================
const deletebannerimage = async (req, res) => {
  try {
    const banner = await Homebanner.findById(req.params.bannerid);
    if (!banner)
      return res.status(404).json({ message: "Banner not found" });

    const image = banner.images.id(req.params.imageid);
    if (!image)
      return res.status(404).json({ message: "Image not found" });

    image.remove();

    // 🔥 RE-CALCULATE POSITIONS
    banner.images = banner.images.map((img, index) => ({
      ...img.toObject(),
      position: index,
    }));

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================================================
// 🔹 REORDER IMAGES (DRAG & DROP SAFE)
// =======================================================
const reorderbannerimages = async (req, res) => {
  try {
    const banner = await Homebanner.findById(req.params.bannerid);
    if (!banner)
      return res.status(404).json({ message: "Banner not found" });

    req.body.order.forEach((item) => {
      const img = banner.images.id(item.imageid);
      if (img) img.position = item.position;
    });

    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =======================================================
// 🔹 DELETE HOME BANNER
// =======================================================
const deletehomebanner = async (req, res) => {
  try {
    const banner = await Homebanner.findById(req.params.bannerid);
    if (!banner)
      return res.status(404).json({ message: "Banner not found" });

    await banner.deleteOne();
    res.json({ success: true, message: "Home banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createhomebanner,
  gethomebanners,
  updatehomebanner,
  addbannerimages,
  updatebannerimage,
  deletebannerimage,
  reorderbannerimages,
  deletehomebanner,
};

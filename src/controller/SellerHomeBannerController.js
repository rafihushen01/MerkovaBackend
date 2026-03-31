const sellerhomebanner=require("../models/SellerHomebanner.js")
const uploadoncloudinary = require("../utils/Cloudinary");
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

    const banner = await sellerhomebanner.create({
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
const gethomebanners = async (req, res) => {
  try {
    const banners = await sellerhomebanner.find({
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
const updatehomebanner = async (req, res) => {
  try {
    const { isactive, navigationlink } = req.body;

    const banner = await sellerhomebanner.findById(req.params.bannerid);
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
const deletehomebanner = async (req, res) => {
  try {
    const banner = await sellerhomebanner.findById(req.params.bannerid);
    if (!banner)
      return res.status(404).json({ message: "Banner not found" });

    await banner.deleteOne();
    res.json({ success: true, message: "Home banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const reorderbannerimages = async (req, res) => {
  try {
    const banner = await sellerhomebanner.findById(req.params.bannerid);
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
module.exports={deletehomebanner,updatehomebanner,gethomebanners,createhomebanner,reorderbannerimages}
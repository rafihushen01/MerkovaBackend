const Shop = require("../models/Shop");
const uploadoncloudinary = require("../utils/Cloudinary");
const crypto = require("crypto");
const User=require("../models/User.js")
/* ======================================================
   ADMIN CREATE SHOP – MERKOVA TRILLION DOLLAR STANDARD
====================================================== */
exports.createShop = async (req, res) => {
  try {
    // ================= AUTH (ENTERPRISE SAFE) =================
    // if (!["Admin", "SuperAdmin"].includes(req.user.role)) {
    //   return res.status(403).json({ success: false, message: "Unauthorized" });
    // }

    // ================= BODY =================
    const {
      shopcode, // generated from frontend (crypto)
      name,
      slug,
      description,
      ShopCapacity,
      storetype,
      specialfor,
      tags,
      owner,
      address,
      bank,
      finance,
      membership,
      approvalstatus,
      visibility,
    } = req.body;

    // ================= CRITICAL VALIDATION =================
    if (!shopcode || !name || !slug || !storetype) {
      return res.status(400).json({
        success: false,
        message: "Missing mandatory shop identifiers",
      });
    }

    const existingcode = await Shop.findOne({ shopcode });
    if (existingcode) {
      return res.status(409).json({
        success: false,
        message: "Shopcode already exists",
      });
    }

    // ================= FILE UPLOADS (SAFE OPTIONAL) =================
    const upload = async (file) =>
      file ? await uploadoncloudinary(file[0].path) : null;

    const thumbnail = await upload(req.files?.thumbnail);
    const profileimage = await upload(req.files?.profileimage);
    const coverimage = await upload(req.files?.coverimage);
    const nid = await upload(req.files?.nid);
    const birthcertificate = await upload(req.files?.birthcertificate);
    const physicalstoreimage = await upload(req.files?.physicalstoreimage);
    const tradelicense = await upload(req.files?.tradelicense);

    // ================= CREATE SHOP =================
    const shop = await Shop.create({
      shopcode,
      isclaimed: false,

      name,
      slug,
      description,
      ShopCapacity,
      storetype,
      specialfor,
      tags,

      thumbnail,
      profileimage,
      coverimage,

      owner: {
        id: null,
        name: owner?.name,
        email: owner?.email,
        bussinessemail: owner?.bussinessemail,
        mobile: owner?.mobile,
        Alternatemobile: owner?.Alternatemobile,
        Gender: owner?.Gender,
        Age: owner?.Age,
        roleupgraded: false,
      },

      verification: {
        nid,
        nidnumber: owner?.nidnumber,
        birthcertificate,
        physicalstoreimage,
        tradelicense,
        tin: owner?.tin,
        bin: owner?.bin,
        verifiedbyadmin: true,
        verifiedat: new Date(),
      },

      address,
      bank,

      finance: {
        onboardingfee: finance?.onboardingfee ?? 500,
        commissionpercent: finance?.commissionpercent ?? 6,
        currentcycle: {
          startdate: new Date(),
          enddate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        revenue: {
          monthlysuccessamount: 0,
          Anuallyrevunue: 0,
          lifetimeincome: 0,
        },
        commission: {
          monthlydue: 0,
        },
      },

      membership: membership || {
        plan: "None",
        isactive: false,
      },

      approvalstatus: approvalstatus || "approved",
      visibility: visibility ?? true,

      createdbyadmin: req.user?.id || null,
    });

    // ================= RESPONSE =================
    res.status(201).json({
      success: true,
      message: "Merkova shop created successfully",
      shopcode: shop.shopcode,
      shopid: shop._id,
    });
  } catch (error) {
    console.error("CREATE SHOP ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create shop",
    });
  }
};
/* ======================================================
   VERIFY SHOP CODE – SELLER CLAIM FLOW (AMAZON STYLE)
====================================================== */
/* ======================================================
   VERIFY & CLAIM SHOP – MERKOVA ENTERPRISE SAFE
====================================================== */
exports.verifyShopCode = async (req, res) => {
  try {
    const { shopcode } = req.body;
    const userData = req.user.userId // from auth middleware: { id, name, email, mobile }

    if (!shopcode) {
      return res.status(400).json({ success: false, message: "Shopcode is required" });
    }

    if (!userData) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const shop = await Shop.findOne({ shopcode });

    if (!shop) {
      return res.status(404).json({ success: false, message: "Invalid shopcode" });
    }

    // ================= ALREADY CLAIMED =================
    if (shop.isclaimed) {
      return res.status(409).json({
        success: false,
        message: `This shop is already owned by another seller. You cannot claim it again.`,
        owner: shop.owner,
      });
    }

    // ================= AUTO CLAIM =================
    shop.isclaimed = true;
    shop.claimedat = new Date();
    shop.owner.id = userData;
    shop.owner.name = userData.name;
    shop.owner.email = userData.email;
  if (userData.mobile) {
  shop.owner.mobile = userData.mobile;
}

    shop.owner.roleupgraded = true;

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Shop claimed successfully! You are now the official owner.",
      shop,
    });
  } catch (error) {
    console.error("VERIFY/CLAIM SHOP ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to verify or claim shop" });
  }
};

exports.getCurrentShopOwner = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const shop = await Shop.findOne({
      "owner.id": userId,
      isclaimed: true,
      approvalstatus: "approved",
    }).lean();

    if (!shop) {
      return res.status(200).json({
        success: true,
        hasShop: false,
        shop: null,
      });
    }

    return res.status(200).json({
      success: true,
      hasShop: true,
      shop,
    });

  } catch (error) {
    console.error("GET CURRENT SHOP OWNER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current shop",
    });
  }
};

/* ======================================================
   EDIT SHOP – SELLER (AMAZON / SHOPIFY GRADE)
====================================================== */
exports.editShop = async (req, res) => {
  try {
    const userData = req.user.userId;

    const shop = await Shop.findOne({
      "owner.id": userData,
      isclaimed: true,
    });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found or unauthorized",
      });
    }

    /* ================= FILE UPLOAD ================= */
    const upload = async (file) =>
      file ? await uploadoncloudinary(file[0].path) : null;

    const thumbnail = await upload(req.files?.thumbnail);
    const profileimage = await upload(req.files?.profileimage);
    const coverimage = await upload(req.files?.coverimage);
    const video = await upload(req.files?.video);

    if (thumbnail) shop.thumbnail = thumbnail;
    if (profileimage) shop.profileimage = profileimage;
    if (coverimage) shop.coverimage = coverimage;
    if (video) shop.video = video;

    if (req.files?.gallery?.length) {
      const galleryUploads = await Promise.all(
        req.files.gallery.map((f) => uploadoncloudinary(f.path))
      );
      shop.gallery.push(...galleryUploads);
    }

    /* ================= PARSE BODY ================= */
    const parse = (val) => {
      try {
        return typeof val === "string" ? JSON.parse(val) : val;
      } catch {
        return null;
      }
    };

    const {
      name,
      description,
      ShopCapacity,
      storetype,
      specialfor,
      tags,
    } = req.body;

    const address = parse(req.body.address);
    const bank = parse(req.body.bank);

    /* ================= BASIC ================= */
    if (name) shop.name = name;
    if (description) shop.description = description;
    if (ShopCapacity) shop.ShopCapacity = ShopCapacity;
    if (storetype) shop.storetype = storetype;
    if (specialfor) shop.specialfor = specialfor;
    if (tags) shop.tags = Array.isArray(tags) ? tags : tags?.split(",");

    /* ================= ADDRESS ================= */
    if (address) {
      shop.address = {
        ...shop.address.toObject(),
        ...address,
        maplocation: {
          lat: address?.maplocation?.lat ?? shop.address.maplocation?.lat,
          lng: address?.maplocation?.lng ?? shop.address.maplocation?.lng,
        },
      };
    }

    /* ================= BANK (FIXED) ================= */
    if (bank) {
      shop.bank = {
        ...shop.bank.toObject(),
        ...bank,
      };
    }

    await shop.save();

    return res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      shop,
    });
  } catch (error) {
    console.error("EDIT SHOP ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Edit shop failed",
    });
  }
};

// 🔥 Follow a Shop
// Follow a Shop
// Follow a Shop
exports.followShop = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { shopId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!shopId) return res.status(400).json({ message: "shopId is required" });

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.followedshops = user.followedshops || [];

    let alreadyFollowing = user.followedshops.includes(shopId);

    if (!alreadyFollowing) {
      user.followedshops.push(shopId);
      await user.save();

      shop.metrics.totalfollowers = (shop.metrics.totalfollowers || 0) + 1;
      await shop.save();
    }

    // Return current state and dynamic followers
    res.status(200).json({ 
      message: `You are ${alreadyFollowing ? "already following" : "now following"} ${shop.name}`,
      followed: true,
      totalfollowers: shop.metrics.totalfollowers
    });

  } catch (err) {
    console.error("FOLLOW SHOP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Unfollow a Shop
exports.unfollowShop = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { shopId } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!shopId) return res.status(400).json({ message: "shopId is required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.followedshops = user.followedshops || [];

    const index = user.followedshops.indexOf(shopId);
    if (index !== -1) {
      user.followedshops.splice(index, 1);
      await user.save();

      const shop = await Shop.findById(shopId);
      if (shop) {
        shop.metrics.totalfollowers = Math.max((shop.metrics.totalfollowers || 1) - 1, 0);
        await shop.save();

        return res.status(200).json({
          message: "Shop unfollowed successfully",
          followed: false,
          totalfollowers: shop.metrics.totalfollowers
        });
      }
    }

    // If user was not following
    res.status(200).json({ 
      message: "You do not follow this shop",
      followed: false,
      totalfollowers: (await Shop.findById(shopId))?.metrics?.totalfollowers || 0
    });

  } catch (err) {
    console.error("UNFOLLOW SHOP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


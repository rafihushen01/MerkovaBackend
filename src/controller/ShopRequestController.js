const ShopRequest = require("../models/ShopRequest");
const Shop = require("../models/Shop");
const uploadoncloudinary = require("../utils/Cloudinary.js");

// ================= CREATE SHOP REQUEST =================
exports.createShopRequest = async (req, res) => {
  try {
    const {
      name,
      description,
      storetype,
      storeaddress,
      owner,
      specialcategories
    } = req.body;

    /* ================= BASIC VALIDATION ================= */
    if (!name || !storetype || !owner) {
      return res.status(400).json({
        success: false,
        message: "Name, storetype and owner details are required."
      });
    }

    // if (!req.files?.nidfrontimage || !req.files?.birthCertificateImage) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "NID front image and Birth Certificate image are mandatory."
    //   });
    // }

    /* ================= SAFE OWNER PARSE ================= */
    let parsedOwner;
    try {
      parsedOwner = typeof owner === "string" ? JSON.parse(owner) : owner;
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid owner data format."
      });
    }

    /* ================= DUPLICATE PENDING CHECK ================= */
    if (parsedOwner?.email) {
      const existingRequest = await ShopRequest.findOne({
        "owner.email": parsedOwner.email,
        status: "Pending"
      });

      if (existingRequest) {
        return res.status(409).json({
          success: false,
          message: "A shop request is already pending for this owner."
        });
      }
    }

    /* ================= NORMALIZE SOCIAL LINKS ================= */
    parsedOwner.socialLinks = {
      instagram: parsedOwner.socialLinks?.instagram || "",
      facebook: parsedOwner.socialLinks?.facebook || "",
      linkedin: parsedOwner.socialLinks?.linkedin || "",
      shopify: parsedOwner.socialLinks?.shopify || "",
      website: parsedOwner.socialLinks?.website || ""
    };

    /* ================= NORMALIZE BANK DETAILS ================= */
    parsedOwner.bankDetails = {
      accountNumber: parsedOwner.bankDetails?.accountNumber || "",
      bankName: parsedOwner.bankDetails?.bankName || "",
      branch: parsedOwner.bankDetails?.branch || "",
      BankCode: parsedOwner.bankDetails?.BankCode || ""
    };

    /* ================= CLOUDINARY UPLOADS ================= */
    const uploadSingle = async (fileKey) =>
      req.files?.[fileKey]
        ? await uploadoncloudinary(req.files[fileKey][0].path)
        : null;

    const uploadMultiple = async (fileKey) =>
      req.files?.[fileKey]
        ? await Promise.all(
            req.files[fileKey].map(file => uploadoncloudinary(file.path))
          )
        : [];

    const nidfrontimage = await uploadSingle("nidfrontimage");
    const nidbackimage = await uploadSingle("nidbackimage");
    const birthCertificateImage = await uploadSingle("birthCertificateImage");
    const profileImage = await uploadSingle("profileImage");
    const shopThumbnail = await uploadSingle("shopThumbnail");
    const physicalStoreImage = await uploadSingle("physicalStoreImage");
    const bankcheckbookimage = await uploadSingle("bankcheckbookimage");

    const additionalDocuments = await uploadMultiple("additionalDocuments");

    /* ================= FINAL SHOP REQUEST OBJECT ================= */
    const shopRequestPayload = {
      name,
      description,
      storetype,
      storeaddress,

      specialcategories: specialcategories
        ? JSON.parse(specialcategories)
        : {},

      owner: {
        id: parsedOwner.id || null,
        name: parsedOwner.name,
        email: parsedOwner.email,
        businessEmail: parsedOwner.businessEmail,
        mobile: parsedOwner.mobile,
        alternateMobile: parsedOwner.alternateMobile,
        dateOfBirth: parsedOwner.dateOfBirth,
        gender: parsedOwner.gender,
        nationality: parsedOwner.nationality,
        nidNumber: parsedOwner.nidNumber,

        tradelicensenumber: parsedOwner.tradelicensenumber,
        BikashMerchantNumber: parsedOwner.BikashMerchantNumber,

        bankDetails: parsedOwner.bankDetails,
        socialLinks: parsedOwner.socialLinks,

        nidfrontimage,
        nidbackimage,
        birthCertificateImage,
        profileImage,
        bankcheckbookimage,

        shopThumbnail,
        physicalStoreImage,
        additionalDocuments
      }
    };

    /* ================= SAVE REQUEST ================= */
    const shopRequest = new ShopRequest(shopRequestPayload);
    await shopRequest.save();

    return res.status(201).json({
      success: true,
      message:
        "Shop request submitted successfully. Awaiting Merkova admin verification."
    });

  } catch (error) {
    console.error("CREATE SHOP REQUEST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


// ================= GET ALL SHOP REQUESTS (ADMIN) =================
exports.getAllShopRequests = async (req, res) => {
  try {
    const requests = await ShopRequest.find()
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      total: requests.length,
      requests
    });
  } catch (error) {
    console.error("GET SHOP REQUESTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shop requests."
    });
  }
};

// ================= UPDATE SHOP REQUEST STATUS =================
exports.updateShopRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, rejectionReason, reviewerComments } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status update."
      });
    }

    const shopRequest = await ShopRequest.findById(requestId);
    if (!shopRequest) {
      return res.status(404).json({
        success: false,
        message: "Shop request not found."
      });
    }

    shopRequest.status = status;
    shopRequest.rejectionReason =
      status === "Rejected" ? rejectionReason || "Not specified" : null;

    shopRequest.reviewerComments = reviewerComments || null;
    shopRequest.reviewedAt = new Date();
    shopRequest.isVerified = status === "Approved";

    await shopRequest.save();

    res.status(200).json({
      success: true,
      message: `Shop request ${status.toLowerCase()} successfully.`
    });
  } catch (error) {
    console.error("UPDATE SHOP REQUEST ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update shop request."
    });
  }
};

exports.deleteShopRequest = async (req, res) => {
  try {
    const { requestId } = req.params;

    // ================= VALIDATION =================
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Shop request ID is required."
      });
    }

    // ================= FETCH REQUEST =================
    const shopRequest = await ShopRequest.findById(requestId);
    if (!shopRequest) {
      return res.status(404).json({
        success: false,
        message: "Shop request not found."
      });
    }

    // ================= SAFETY CHECK =================
    // Optional: prevent deleting already approved shops
    if (shopRequest.status === "Approved") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete an approved shop request. Consider deactivation instead."
      });
    }

    // ================= DELETE SHOP REQUEST =================
    await ShopRequest.findByIdAndDelete(requestId);

    // Optional: if shop request has linked Shop entry, delete it as well
    if (shopRequest.owner?.id) {
      const linkedShop = await Shop.findOne({ owner: shopRequest.owner.id });
      if (linkedShop) {
        await Shop.findByIdAndDelete(linkedShop._id);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Shop request deleted successfully."
    });
  } catch (error) {
    console.error("DELETE SHOP REQUEST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete shop request."
    });
  }
}
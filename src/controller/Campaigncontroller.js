const campaign = require("../models/Campaign");
const uploadoncloudinary = require("../utils/Cloudinary");

/* ================= CREATE CAMPAIGN ================= */
const createcampaign = async (req, res) => {
  try {
    const { name, title, navlink, startdate, enddate } = req.body;

    if (!name || !title)
      return res.status(400).json({ success: false, message: "Name & title required" });

    let bannerurl = null;
    if (req.file?.path) {
      bannerurl = await uploadoncloudinary(req.file.path);
    }

    const newcampaign = await campaign.create({
      name,
      title,
      navlink,
      startdate,
      enddate,
      banner: bannerurl ? { url: bannerurl } : undefined,
    });

    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      campaign: newcampaign,
    });
  } catch (error) {
    console.error("Create campaign error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ================= ADD SECTION ================= */
const addcampaignsection = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, navlink, position } = req.body;

    const campaigndata = await campaign.findById(id);
    if (!campaigndata)
      return res.status(404).json({ success: false, message: "Campaign not found" });

    let imageurl = null;
    if (req.file?.path) {
      imageurl = await uploadoncloudinary(req.file.path);
    }

    campaigndata.sections.push({
      title,
      subtitle,
      navlink,
      position: position || campaigndata.sections.length,
      image: imageurl ? { url: imageurl } : undefined,
    });

    await campaigndata.save();

    res.status(200).json({
      success: true,
      message: "Section added successfully",
      campaign: campaigndata,
    });
  } catch (error) {
    console.error("Add section error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* ================= GET ACTIVE CAMPAIGNS ================= */
const getactivecampaigns = async (req, res) => {
  try {
    const campaigns = await campaign
      .find({ isactive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      campaigns, // 🔥 frontend friendly
    });
  } catch (error) {
    console.error("Get campaigns error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
const deletecampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCampaign = await campaign.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return res.status(404).json({ success: false, message: "Campaign not found" });
    }

    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    console.error("Delete campaign error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
module.exports = {
  createcampaign,
  addcampaignsection,
  getactivecampaigns,
  deletecampaign
};

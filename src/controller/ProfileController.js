const user = require("../models/User");
const  uploadoncloudinary= require("../utils/Cloudinary");
const {sendsellernewgmailotp} = require('../utils/Mail.js')
const crypto = require("crypto");
const bcrypt=require("bcryptjs")
// ================= GET PROFILE =================
const getprofile = async (req, res) => {
  try {
    const userdata = await user
      .findById(req.user.userId)
      .select("-password -resetotp -resetOtpExpires");

    if (!userdata) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, userdata });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE TEXT DATA =================
const updateprofile = async (req, res) => {
  try {
    const { action } = req.body;

    const currentuser = await user.findById(req.user.userId);
    if (!currentuser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    /* ======================================================
       1️⃣ BASIC PROFILE UPDATE
    ====================================================== */
    if (action === "update_profile") {
      const { name, mobile, gender, address } = req.body;

      if (name !== undefined) currentuser.name = name;
      if (mobile !== undefined) currentuser.mobile = mobile;
      if (gender !== undefined) currentuser.gender = gender;
      if (address !== undefined) currentuser.address = address;

      await currentuser.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully"
      });
    }

    /* ======================================================
       2️⃣ CHANGE PASSWORD
    ====================================================== */
    if (action === "change_password") {
      const { oldpassword, newpassword } = req.body;

      if (!oldpassword || !newpassword) {
        return res.status(400).json({
          success: false,
          message: "Old and new passwords are required"
        });
      }

      const ismatch = await bcrypt.compare(oldpassword, currentuser.password);
      if (!ismatch) {
        return res.status(401).json({
          success: false,
          message: "Old password incorrect"
        });
      }

      const salt = await bcrypt.genSalt(12);
      currentuser.password = await bcrypt.hash(newpassword, salt);
      await currentuser.save();

      return res.status(200).json({
        success: true,
        message: "Password changed successfully"
      });
    }

    /* ======================================================
       3️⃣ REQUEST EMAIL CHANGE (SEND OTP)
    ====================================================== */
    if (action === "request_email_change") {
      const otp = crypto.randomInt(100000, 999999).toString();

      currentuser.sellernewgmailotp = otp;
      currentuser.sellernewgmailotpisverfied = false;
      currentuser.sellerchangeemailchangetime =
        new Date(Date.now() + 5 * 60 * 1000);

      await currentuser.save();
      await sendsellernewgmailotp(currentuser.email, otp);

      return res.status(200).json({
        success: true,
        message: "OTP sent to your current email"
      });
    }

    /* ======================================================
       4️⃣ VERIFY EMAIL OTP
    ====================================================== */
    if (action === "verify_email_otp") {
      const { otp } = req.body;

      if (
        !currentuser.sellernewgmailotp ||
        currentuser.sellerchangeemailchangetime < Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message: "OTP expired"
        });
      }

      if (currentuser.sellernewgmailotp !== otp) {
        return res.status(401).json({
          success: false,
          message: "Invalid OTP"
        });
      }

      currentuser.sellernewgmailotpisverfied = true;
      await currentuser.save();

      return res.status(200).json({
        success: true,
        message: "OTP verified successfully"
      });
    }

    /* ======================================================
       5️⃣ CONFIRM NEW EMAIL
    ====================================================== */
    if (action === "confirm_new_email") {
      const { email, password } = req.body;

      if (!currentuser.sellernewgmailotpisverfied) {
        return res.status(403).json({
          success: false,
          message: "OTP verification required"
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message: "Password required"
        });
      }

      const isvalid = await bcrypt.compare(password, currentuser.password);
      if (!isvalid) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }

      const emailexist = await user.findOne({ email });
      if (emailexist) {
        return res.status(409).json({
          success: false,
          message: "Email already in use"
        });
      }

      currentuser.email = email;

      /* ===== CLEAN OTP STATE ===== */
      currentuser.sellernewgmailotp = null;
      currentuser.sellernewgmailotpisverfied = false;
      currentuser.sellerchangeemailchangetime = null;

      await currentuser.save();

      return res.status(200).json({
        success: true,
        message: "Email updated successfully"
      });
    }

    /* ======================================================
       ❌ INVALID ACTION
    ====================================================== */
    return res.status(400).json({
      success: false,
      message: "Invalid action"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateprofile };

// ================= UPDATE AVATAR =================
const updateavatar = async (req, res) => {
  try {
    if (!req.file) 
      return res.status(400).json({ success: false, message: "No image provided" });

    // Find the user
    const existingUser = await user.findById(req.user?.userId);
    if (!existingUser) 
      return res.status(404).json({ success: false, message: "User not found" });

    // Upload new avatar to Cloudinary
    const cloudUrl = await uploadoncloudinary(req.file.path);

    // Update user's avatar
    existingUser.avatar.path = cloudUrl;
    await existingUser.save();

    // Prepare user object to send (remove sensitive info)
    const updateduser = existingUser.toObject();
    delete updateduser.password;
    delete updateduser.resetotp;
    delete updateduser.resetOtpExpires;

    res.status(200).json({ success: true, message: "Avatar updated successfully", updateduser });
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    res.status(500).json({ success: false, message: error?.message || "Internal server error" });
  }
};


module.exports = { getprofile, updateprofile, updateavatar };

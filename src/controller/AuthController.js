const user = require("../models/User");
const bcrypt =require("bcryptjs");
const gentoken = require("../utils/token");
const emailotpModel = require("../models/EmailOtp");
const crypto = require("crypto");
const { sendotp ,sendsuperadminotp, sendsellerverifyotp,sendnewusersignupotp,sendusersigninotp} = require("../utils/Mail");
const tempsignup=require("../models/Tempuser");
const generateSecureOtp = () => {
  return crypto
    .randomBytes(6)
    .toString("base64")
    .replace(/[^a-zA-Z0-9@#]/g, "")
    .slice(0, 8);
};
const MAX_SIGNIN_OTP_RESENDS = 20;
const MAX_WRONG_OTP_ATTEMPTS = 20;
const OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
const TEMP_SUSPEND = 60 * 60 * 1000; 
const otpExpiry = () => new Date(Date.now() + 5 * 60 * 1000);


const signup = async (req, res) => {
  try {
    const { step } = req.body;

    // ==========================
    // STEP 1 → SEND OTP
    // ==========================
    if (step === "send-otp") {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password too short" });
      }

      // 🚫 already real user exists
      const realuser = await user.findOne({ email });
      if (realuser) {
        return res.status(409).json({ success: false, message: "User already exists" });
      }

      let tempuser = await tempsignup.findOne({ email });

      if (tempuser && tempuser.resendcount >= 5) {
        return res.status(429).json({ success: false, message: "OTP resend limit exceeded" });
      }

      const hashedpassword = await bcrypt.hash(password, 10);
      const otp = generateSecureOtp();

      await tempsignup.findOneAndUpdate(
        { email },
        {
          name,
          email,
          password: hashedpassword,
          otp,
          otpexpires: Date.now() + 5 * 60 * 1000,
          resendcount: tempuser ? tempuser.resendcount + 1 : 1,
        },
        { upsert: true, new: true }
      );

      await sendnewusersignupotp(email, otp);

      return res.status(200).json({ success: true, message: "OTP sent" });
    }

    // ==========================
    // STEP 2 → VERIFY OTP
    // ==========================
    if (step === "verify-otp") {
      const { email, otp } = req.body;

      const tempuser = await tempsignup.findOne({ email });

      if (!tempuser) {
        return res.status(404).json({ success: false, message: "Signup session not found" });
      }

      if (tempuser.otpexpires < Date.now()) {
        return res.status(400).json({ success: false, message: "OTP expired" });
      }

      if (tempuser.otp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
      }

      tempuser.otpisverified = true;
      tempuser.otp = null;
      tempuser.otpexpires = null;

      await tempuser.save();

      return res.status(200).json({ success: true, message: "OTP verified" });
    }

    // ==========================
    // STEP 3 → COMPLETE PROFILE
    // ==========================
    if (step === "complete-profile") {
      const { email, gender, mobile, role, address } = req.body;

      const tempuser = await tempsignup.findOne({ email });

      if (!tempuser || !tempuser.otpisverified) {
        return res.status(403).json({ success: false, message: "OTP not verified" });
      }

      let avatar =
        gender === "Male"
          ? user.schema.paths.maleavatar.defaultValue
          : gender === "Female"
          ? user.schema.paths.femaleavatar.defaultValue
          : user.schema.paths.othersavatar.defaultValue;

      const newuser = await user.create({
        name: tempuser.name,
        email,
        password: tempuser.password,
        gender,
        mobile,
        role,
        avatar,
      address: Array.isArray(address)
  ? address.map(addr => ({
      district: addr.district,
      area: addr.upazila,        // frontend uses upazila
      city: addr.division,       // division → city
      state: "Bangladesh",
      zip: addr.zip,
      fulladdress: addr.fulladdress,
    }))
  : [],

      });

      await tempsignup.deleteOne({ email });

      const token = await gentoken(newuser._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 3 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        success: true,
        message: "Signup completed",
        user: newuser,
      });
    }

    return res.status(400).json({ success: false, message: "Invalid step" });

  } catch (error) {
    console.error("MERKOVA SIGNUP ERROR:", error);
    return res.status(500).json({ success: false, message: "Signup failed" });
  }
};


const signin = async (req, res) => {
  try {
    const { email, password, otp, secretcode } = req.body;
    const deviceid = req.headers["x-device-id"] || "unknown";

    /* ================= SUPER ADMIN UNIVERSAL ENTRY ================= */
    if (email === process.env.SUPER_ADMIN) {
      let superuser = await user.findOne({ email });

      if (!superuser) {
        superuser = await user.create({
          email,
          role: "SuperAdmin",
          isverify: false,
        });
      }

      if (password !== process.env.SUPER_ADMIN_PASS) {
        return res.status(400).json({ success: false, message: "Invalid SuperAdmin credentials" });
      }

      // Step 1 → Send OTP
      if (!otp && !secretcode) {
        const superotp = Math.floor(100000 + Math.random() * 900000);
        superuser.supverificationotp = superotp;
        superuser.superadminotpexpires = Date.now() + OTP_EXPIRY;
        await superuser.save();
        await sendsuperadminotp(email, superotp);

        return res.status(200).json({
          success: true,
          step: "SUPERADMIN_OTP_SENT", // Identified Step
          message: "OTP sent to SuperAdmin email",
        });
      }

      // Step 2 → Verify OTP
      if (otp && !secretcode) {
        if (
          Number(otp) !== Number(superuser.supverificationotp) ||
          superuser.superadminotpexpires < Date.now()
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired SuperAdmin OTP",
          });
        }

        return res.status(200).json({
          success: true,
          step: "SECRET_CODE_REQUIRED", // Identified Step
          message: "OTP verified successfully",
        });
      }

      // Step 3 → Verify Secret Code
      if (otp && secretcode) {
        if (secretcode !== process.env.SUPER_ADMIN_SECRETCODE) {
          return res.status(400).json({
            success: false,
            message: "Invalid SuperAdmin secret code",
          });
        }

        superuser.role = "SuperAdmin";
        superuser.isverify = true;
        superuser.supverificationotp = null;
        superuser.superadminotpexpires = null;
        await superuser.save();

        const token = await gentoken(superuser._id);
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          maxAge: 3 * 24 * 60 * 60 * 1000,
          path: "/",
        });

        return res.status(200).json({
          success: true,
          message: "SuperAdmin signin successful",
          user: {
            name: process.env.SUPER_ADMIN_NAME,
            email,
            role: "SuperAdmin",
          },
        });
      }
    }

    /* ================= NORMAL USER SIGNIN ================= */
    const existinguser = await user.findOne({ email });
    if (!existinguser) {
      return res.status(404).json({ success: false, message: "User does not exist" });
    }

    // Step 1 → Send OTP
    if (password && !otp) {
      const ispasswordcorrect = await bcrypt.compare(password, existinguser.password);
      if (!ispasswordcorrect) {
        return res.status(400).json({ success: false, message: "Invalid credentials" });
      }

      const newotp = generateSecureOtp();
      existinguser.customerssigninotp = newotp;
      existinguser.coustomersigninotpisverified = false;
      existinguser.coustomersigninotpisexpires = Date.now() + OTP_EXPIRY;
      existinguser.signinotpresendcount += 1;
      await existinguser.save();

      await sendusersigninotp(email, newotp);

      // FIXED: Added 'step' so frontend knows not to redirect yet
      return res.status(200).json({ 
        success: true, 
        step: "USER_OTP_SENT", 
        message: "Signin OTP sent" 
      });
    }

    // Step 2 → Verify OTP
    if (otp) {
      if (existinguser.coustomersigninotpisexpires < Date.now() || existinguser.customerssigninotp !== otp) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      }

      existinguser.coustomersigninotpisverified = true;
      existinguser.customerssigninotp = null;
      existinguser.coustomersigninotpisexpires = null;
      await existinguser.save();

      const token = await gentoken(existinguser._id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 3 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      return res.status(200).json({
        success: true,
        message: "Signin successful",
        user: existinguser,
      });
    }

    return res.status(400).json({ success: false, message: "Invalid signin request" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Signin failed" });
  }
};

const signout=async (req,res) => {
    res.clearCookie("token");
    res.status(200).json({message:"User signed out successfully",success:true});
}


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await user.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Set OTP and Expiry (Current time + 5 minutes)
    existingUser.resetotp = otp;
    existingUser.resetOtpExpires = Date.now() + 5 * 60 * 1000; 
    await existingUser.save();

    // Send Email
    await sendotp(email, otp);

    res.status(200).json({ success: true, message: "OTP sent to your email (Expires in 5 mins)" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const existingUser = await user.findOne({ email });

    if (!existingUser) {
      return res.status(400).json({ success: false, message: "User not found" });
    }

    // Check if OTP is valid and NOT expired
    if (existingUser.resetotp !== Number(otp)) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (Date.now() > existingUser.resetOtpExpires) {
        existingUser.resetotp = null;
        existingUser.resetOtpExpires = null;
        await existingUser.save();
        return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    existingUser.password = hashedPassword;
    existingUser.resetotp = null;
    existingUser.resetOtpExpires = null;
    await existingUser.save();

    res.status(200).json({ success: true, message: "Password Reset successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
const getCurrentUser = async (req, res) => {
  try {
   

    const userId = req.user.userId; // ✅ FIXED


    const currentUser = await user
      .findById(userId)
      .select("-password -resetotp -resetOtpExpires");

    if (!currentUser) {
  
      return res.status(404).json({ success: false, message: "User not found" });
    }


    res.status(200).json({ success: true, currentUser });
  } catch (error) {
    console.error("🔥 getCurrentUser ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const sellersignup = async (req, res) => {
  try {
    const { name, email, password, mobile, address, gender } = req.body;

    // validations
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    if (mobile && mobile.length < 10) {
      return res.status(400).json({ message: "Mobile number must be at least 10 digits long" });
    }

    const existinguser = await user.findOne({ email });
    if (existinguser) {
      return res.status(400).json({ message: "Seller already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // gender based avatar
  let avatar;

if (gender === "Male") {
  avatar = user.schema.paths.maleavatar.defaultValue;
} else if (gender === "Female") {
  avatar = user.schema.paths.femaleavatar.defaultValue;
} else {
  avatar = user.schema.paths.othersavatar.defaultValue;
}

    const newuser = await user.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      address,
      gender,
      role: "Seller",
      avatar
    });

    const token = await gentoken(newuser._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(201).json({
      success: true,
      message: "Seller signed up successfully",
      newuser,
    });

  } catch (error) {
    console.error("Seller Signup Error:", error);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// controllers/followController.js

const getFollowedShops = async (req, res) => {
  try {
    const userId = req.user.userId;

    const foundUser = await user.findById(userId).populate({
      path: "followedshops",
      select: "name slug storetype coverimage rating metrics",
    });

    res.status(200).json({ followedshops: foundUser.followedshops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
const sendsellerotp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    // send mail
    await sendsellerverifyotp(email, otp);

    // upsert otp record
    await emailotpModel.findOneAndUpdate(
      { email },
      {
        otp,
        expiresat: Date.now() + 5 * 60 * 1000,
        isverified: false,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const verifysellerotp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    const record = await emailotpModel.findOne({ email });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP not requested",
      });
    }

    if (record.expiresat < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (record.otp !== Number(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    record.isverified = true;
    record.otp = null;
    record.expiresat = null;
    await record.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const googlesignup = async (req, res) => {
  try {
    const { email, name } = req.body; // role & mobile বাদ
    let existinguser = await user.findOne({ email });

    if (!existinguser) {
      const newUser = await user.create({
        name,
        email,
        role: "User" // default role
      });

      const token = await gentoken(newUser._id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 3*24*60*60*1000,
      });

      return res.status(200).json({ success: true, user: newUser });
    } else {
      // existing user → login
      const token = await gentoken(existinguser._id);
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 3*24*60*60*1000,
      });
      return res.status(200).json({
        success: true,
        message: "User already exists, logged in successfully",
        user: existinguser,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: `googleauth error: ${error.message}`, success:false });
  }
};
const googlelogin = async(req,res) => {
  try {
    const { name, email } = req.body;
    const existinguser = await user.findOne({ email });
    if(!existinguser){
      return res.status(400).json({ message: "User does not exist, go to signup first" });
    }

    existinguser.name = name; // optional update
    const token = await gentoken(existinguser._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 3*24*60*60*1000,
    });
    return res.status(200).json({ message: "Login Successful", success:true });
  } catch (error) {
    return res.status(500).json({ message: `googleauth error: ${error.message}`, success:false });
  }
}



module.exports={signup,signin,signout,forgotPassword,resetPassword,getCurrentUser,sellersignup,verifysellerotp,sendsellerotp,getFollowedShops,googlelogin,googlesignup};
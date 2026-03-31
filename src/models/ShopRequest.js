const mongoose = require("mongoose");

const shopRequestSchema = new mongoose.Schema(
  {
    // ================= BASIC SHOP INFO =================
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
    storetype: {
      type: String,
      enum: [
        "SmartPhones", "Electronic & Appliances", "Television",
        "Washing Machine", "Mobile Accessories", "Computers",
        "Computers Accessories", "Mens Watches", "Womens Watches",
        "Electronics Vehicles [EV]", "Mens Clothing Shop",
        "Womens Clothing Shop", "Kids Clothing Shop", "Teens Clothing Shop",
        "MediCare Shop", "Beauty & Cosmetics Shop",
        "Lingerie & Undergarments Shop", "Laptop Shop"
      ],
      required: true
    },
    storeaddress:{

      type:String
    },


    // ================= SPECIAL CATEGORIES =================
    specialcategories: {
      type: Map,
      of: [String],
      default: {}
    },

    // ================= OWNER INFO =================
    owner: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String, trim: true, required: true },
      email: { type: String, lowercase: true, sparse: true },
      businessEmail: { type: String, lowercase: true, sparse: true },
      mobile: { type: String, sparse: true },
      alternateMobile: { type: String },
      dateOfBirth: { type: Date },
      gender: { type: String, enum: ["Male", "Female", "Other"] },
      nationality: { type: String },
      nidNumber: { type: String },
      bankDetails: {
        accountNumber: { type: String },
        bankName: { type: String },
        branch: { type: String },
        BankCode: { type: String },
         
      },
      socialLinks: {
        instagram: { type: String },
        facebook: { type: String },
        linkedin: { type: String },
        shopify:{type:String},
        website: { type: String },
      },
      nidfrontimage: { type: String, required: true },
      nidbackimage:{type:String},
      tradelicensenumber:{type:String},
      BikashMerchantNumber:{type:String},
    
      birthCertificateImage: { type: String, required: true },
      profileImage: { type: String },
      bankcheckbookimage:{type:String},

      shopThumbnail: { type: String },
      physicalStoreImage: { type: String },
      additionalDocuments: [{ type: String }]
     
    },
   

    // ================= SHOP STATUS =================
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },
    rejectionReason: { type: String, default: null },
    reviewerComments: { type: String, default: null },
    isVerified: { type: Boolean, default: false },

    // ================= AUDIT & TRACKING =================
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for faster search & admin filtering
shopRequestSchema.index({ "owner.name": "text", "owner.email": "text", name: "text", status: 1 });

module.exports = mongoose.model("ShopRequest", shopRequestSchema);

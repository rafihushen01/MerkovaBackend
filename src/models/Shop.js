const mongoose = require("mongoose");

const shopschema = new mongoose.Schema(
  {
    // ================= CORE IDENTIFIERS =================
    shopcode: { type: String, unique: true, index: true },

    isclaimed: { type: Boolean, default: false },
    claimedat: { type: Date, default: null },

    // ================= BASIC IDENTITY =================
    name: { type: String, trim: true },
    slug: { type: String, lowercase: true, index: true },
    description: { type: String },
   ShopCapacity:{

    type:String,
    enum:["Small","Large","Big","Huge","Company","Empire"]
   },
    storetype: { type: String ,

      enum: [
        "SmartPhones",
        "Electronic & Appliances",
        "Television",
        "Washing Machine",
        "Mobile Accessories",
        "Computers",
        "Computers Accessories",
        "Mens Watches",
        "Pc Shop",
        'Laptop Shop',
        "Womens Watches",
        "Electronics Vehicles [EV]",
        "Mens Clothing Shop",
        "Womens Clothing Shop",
        "Kids Clothing Shop",
        "Teens Clothing Shop",
        "MediCare Shop",
        "Beauty & Cosmetics Shop",
        "Fragrance & ATAR Shop",
        "Muslim Fashion ",
        "Mens Shoes Shop",
        "Womens Shoes Shop",
        "Snacks,Chocolate & Groccery Shop",
       "Panjabi & Muslim Shop",
       
        "Lingerie & Undergarments Shop",
        "Laptop Shop",
        "Health & Sexual Product Shop",
        "Toys Shop",
        "Gym Clothing & Products Shop",
        "Pet & Pet Food Shop",
        "Plus Size Fashion",
        "Book Shop"

      
      ],

   



    },

    specialfor:{

      type:String,
      
    },
    positiverating:{

      type:String,
      default:0
    },


    tags: [{ type: String }],

    // ================= MEDIA =================
    thumbnail: String,
    profileimage: String,
    coverimage: String,
    gallery: [{ type: String }],
    video: String,

    // ================= OWNER =================
    owner: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: { type: String, lowercase: true },
      bussinessemail:{
        type:String,
      },
      Alternatemobile:{type:Number},
     Gender:{
      type:String,
      enum:["Male","Female","Other"]
     },
     Age:{

      type:String,

     },



      mobile: String,
      roleupgraded: { type: Boolean, default: false },
      backupcode: { type: String, default: null } // used if owner forgets shopcode

    },

    // ================= DOCUMENTS =================
    verification: {
      nid: String,
      nidnumber: String,
      birthcertificate: String,
      physicalstoreimage: String,
      tradelicense: String,
      tin: String,
      bin: String,
      verifiedbyadmin: { type: Boolean, default: false },
      verifiedat: Date,
    },

    // ================= ADDRESS =================
    address: {
      country: { type: String, default: "Bangladesh" },
      division: String,
      district: String,
      city: String,
      area: String,
      zipcode: String,
      fulladdress: String,
      maplocation: {
        lat: Number,
        lng: Number,
      },
    },

    // ================= BANK & PAYOUT =================
    bank: {
      accountholdername: String,
      bankname: String,
      branch: String,
      accountnumber: String,
      mobilenumber: String,
     AccountType:{


      type:String,
      enum:["Personal","Bussiness"]
     },
      SWIFTCODE:String,
      BanKLocation:String,
      payoutmethod: {
        type: String,
        enum: ["Bank", "Bkash", "Nagad", "Rocket"],
      },
    },

    // ================= STATUS =================
    approvalstatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    issellerlocked: { type: Boolean, default: false },
    lockreason: String,
    lockat: Date,
shopitems: [
  {
    // ================= CORE =================
    title: String,
    description: String,
    tags_text: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    keywords_text: String,

    // ================= BRAND =================
    brand: String,
    model: String,
    specification: String,
    warranty: String,
    availableoffers: String,

    // ================= CATEGORY =================
    categoryid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MerkovaCategory"
    },
    categoryname: String,

    subcategories: [
      {
        subcategoryid: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MerkovaCategory"
        },
        subcategoryname: String,
        tags: [String],
        filters: mongoose.Schema.Types.Mixed
      }
    ],

    // ================= FILTERS =================
    age: String,
    sex: String,
    material: String,
    season: String,

    // ================= COLOR VARIANTS =================
    colorvariants: [
      {
        colorname: String,
        colorhex: String,

        images: [
          {
            url: String,
            isprimary: { type: Boolean, default: false }
          }
        ],

        videos: [
          {
            url: String
          }
        ],

        // 🔥 FIXED: OBJECT BASED SIZES (NO STRING)
        sizes: [
          {
            label: String,
            price: Number,
            quantity: Number,
            sku: String
          }
        ],

        isactive: { type: Boolean, default: true }
      }
    ],

    // ================= SIZE VARIANTS =================
    sizevariants: [
      {
        label: String,
        price: Number,
        quantity: Number,
        sku: String
      }
    ],

    // ================= PRICING =================
    baseprice: Number,
    discountpercent: Number,
    discountprice: Number,
    currentprice: Number,
    currency: { type: String, default: "USD" },

    // ================= STOCK & STATUS =================
    stockstatus: String,
    isactive: { type: Boolean, default: true },
    isapproved: { type: Boolean, default: true },
    isdeleted: { type: Boolean, default: false },

    // ================= METRICS =================
    totalsold: { type: Number, default: 0 },
    totalviews: { type: Number, default: 0 },
    totalwishlist: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    totalreviews: { type: Number, default: 0 },

    // ================= OWNERSHIP =================
    sellerid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    shopid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop"
    },

    // ================= TIMESTAMPS =================
    createdAt: Date,
    updatedAt: Date
  }
]

,


   shopcategories: { type: [String], default: [] },
shopsubcategories: { type: [String], default: [] },


    visibility: { type: Boolean, default: true },

    // ================= PERFORMANCE =================
    rating: {
      average: { type: Number, default: 0 },
      totalreviews: { type: Number, default: 0 },
    },


    metrics: {
      totalproducts: { type: Number, default: 0 },
      totalsold: { type: Number, default: 0 },
      totalorders: { type: Number, default: 0 },
      totalreturns: { type: Number, default: 0 },
      totalfollowers: { type: Number, default: 0 },
      totalvisitor:{type:Number, default:0}
    },

    badges: {
      bestseller: { type: Boolean, default: false },
      topbrand: { type: Boolean, default: false },
    Newinmerkova:{type:Boolean ,default:true},
      bluebadge: { type: Boolean, default: false },
      verifiedcompany: { type: Boolean, default: false },
    },

    // ================= FINANCE (MERKOVA HEART) =================
    finance: {
      onboardingfee: { type: Number, default: 500 },

      commissionpercent: {
        type: Number,
        default: 6, // superadmin editable
      },

      currentcycle: {
        startdate: Date,
        enddate: Date,
      },

      revenue: {
        monthlysuccessamount: { type: Number, default: 0 },
        Anuallyrevunue:{type:Number, default:0},
        lifetimeincome: { type: Number, default: 0 },
      },

      commission: {
        monthlydue: { type: Number, default: 0 },
        lastpaidamount: Number,
        lastpaymentdate: Date,
        duedate: Date,
      },
    },

    // ================= MEMBERSHIP =================
    membership: {
      plan: {
        type: String,
        enum: ["None", "Basic", "Pro", "Elite", "Eliteplus"],
        default: "None",
      },
      startdate: Date,
      enddate: Date,
      isactive: { type: Boolean, default: false },
      price: Number,
      durationmonths: Number,
    },

    // ================= SYSTEM =================
    createdbyadmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

shopschema.index({ name: "text", slug: 1, storetype: 1 });
module.exports = mongoose.model("Shop", shopschema);

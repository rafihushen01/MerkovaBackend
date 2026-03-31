const mongoose = require("mongoose");

/* ===================== BASIC REUSABLE SCHEMAS ===================== */

const dimensionSchema = new mongoose.Schema({
  length: String,
  width: String,
  height: String
}, { _id: false });

const priceSchema = new mongoose.Schema({
  baseprice: Number,
  discountpercent:Number,
  discountprice: Number,
  currentprice: Number,
  currency: { type: String, default: "BDT" },
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url: String,
  caption: String,
  isprimary: Boolean,
  linkeditemid: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }
}, { _id: false });

const videoSchema = new mongoose.Schema({
  url: String,
  title: String,
  duration: Number,
  linkeditemid: { type: mongoose.Schema.Types.ObjectId, ref: "Item" }
}, { _id: false });

/* ===================== SIZE VARIANT ===================== */

const sizeSchema = new mongoose.Schema({
  label: String,
  sku: String,
  quantity: Number,
  price: priceSchema,
  specialpriceduration:Date,
  weight: String,
  dimensions: dimensionSchema
}, { _id: false });

/* ===================== COLOR VARIANT ===================== */

const colorVariantSchema = new mongoose.Schema({
  colorname: String,
  colorhex: String,

  media: {
    images: [imageSchema],
    videos: [videoSchema]
  },

  sizes: [sizeSchema],
  isactive: { type: Boolean, default: true }
}, { _id: false });

/* ===================== BRAND / SELLER MEDIA BLOCK ===================== */

const brandMediaSchema = new mongoose.Schema({
  sectiontype: { type: String, enum: ["single", "carousel"] },
  title: String,
  subtitle: String,
  images: [imageSchema],
  videos: [videoSchema],
  maximages: { type: Number, default: 100 }
}, { _id: false });

const sizechartschema = new mongoose.Schema({
  
 
  images: [imageSchema],
 
 
}, { _id: false });

/* ===================== MODEL BODY INFO (FASHION) ===================== */

const modelInfoSchema = new mongoose.Schema({
  modelname: String,
  gender:String,

  required: {
    height: String,
    chest: String,
    bust: String,
    waist: String,
    hip: String
  },

  optional: {
    waist: String,
    hip: String,
    shoulder: String,
    footsize: String
  }
}, { _id: false });

/* ===================== SHIPPING ===================== */
returnandrefundpolicyschema=new mongoose.Schema({
  duration:String,
  conditions:String,
  norefundavalible:Boolean,
  nonereturnableitems:String,
  process:String
},{_id:false});
const shippingSchema = new mongoose.Schema({
  weight: String,
  dimensions: dimensionSchema,
  isdangerous: Boolean,
  deliverytype:{

    type:String,
   
  },
  shipsfrom: {

    type:String,
    
  },
  shippingfee: Number,
  isfrozenorglassyproduct:Boolean,
  IntructionfordangerousProduct:String,
  handlingtime: String
}, { _id: false });

/* ===================== ITEM SCHEMA ===================== */

const itemSchema = new mongoose.Schema({

  /* ===== GLOBAL IDENTITY ===== */
  itemid: { type: String, unique: true, index: true },
  itemurl: { type: String, unique: true, index: true },
  slug: { type: String, index: true },

  /* ===== CORE CONTENT ===== */
  title: { type: String, index: true },
  sizechartimage: sizechartschema,
  description: String,
  highlights: String,

  tags_text: String,
  keywords:[ String],
  barcode: String,
  sku: String,

  /* ===== BRAND ===== */
  brand: String,
  brandstory: String,
  brandorigin: String,
  modelnumber: String,
  serialnumber: String,
  warranty: String,
  certifications: [String],
  availableoffers: String,

  /* ===== CATEGORY ===== */
  categoryid: { type: mongoose.Schema.Types.ObjectId, ref: "MerkovaCategory" },
  categoryname: String,
  subcategories: [{
    subcategoryid: mongoose.Schema.Types.ObjectId,
    subcategoryname: [String],
    tags: [String],
    filters: mongoose.Schema.Types.Mixed
  }],

  /* ===== VARIANTS ===== */
  colorvariants: [colorVariantSchema],

  /* ===== PRICING (BASE FALLBACK) ===== */
  pricing: priceSchema,

  /* ===== MODEL / FIT ===== */
  modelinfo: modelInfoSchema,

  /* ===== ATTRIBUTES (AMAZON-STYLE HUGE BLOCK) ===== */
  attributes: {
    gender:{
      type:String,
      enum:["Male","Female","Unisex"]
    },
    agegroup: {

      type:String
    },

    /* Electronics */
    batterycapacity: String,
    chargingtime: String,
    connectivity: String,
    displayresolution: String,
    screensize: String,
    refreshrate: String,
    processor: String,
    ram: String,
    storage: String,
    graphics: String,
    operatingsystem: String,
    ports: [String],

    /* Fashion */
    material: String,
    fabriccare: String,
    fit: String,

    season: String,
    pattern: String,
    neckline: String,
    sleeve: String,
    occasion: String,


    /* Shoes */
    soles: String,
    closure: String,
    toeShape: String,

    /* Beauty */
    skinType: String,
    formulation: String,
    fragrance: String,

    /* Grocery */
    expirydate: String,
    origin: String,
    organic: Boolean,

    /* Books */
    author: String,
    publisher: String,
    isbn: String,
    language: String,

    /* Furniture */
    assemblyrequired: Boolean,
    woodtype: String,
    upholstery: String,

    /* Vehicles */
    fueltype: String,
    mileage: String,
    enginecapacity: String,

    /* Universal */
    countryoforigin: String,
    safetyinformation: String
  },

  /* ===== MEDIA ===== */
  whiteimage: imageSchema,
  brandmedia: [brandMediaSchema],

  /* ===== SHIPPING ===== */
  shipping: shippingSchema,

  /* ===== METRICS ===== */
  metrics: {
    totalviews: { type: Number, default: 0 },
    totalsold: { type: Number, default: 0 },
    wishlistcount: { type: Number, default: 0 },
    averagetimeonpage: Number,
    peoplespendtimeofthisproduct:Number,

    clickthroughrate: Number
  },

  /* ===== REVIEWS ===== */
  rating: { type: Number, default: 0 },
  totalreviews: { type: Number, default: 0 },

  /* ===== OWNERSHIP ===== */
  sellerid: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  shopid: { type: mongoose.Schema.Types.ObjectId, ref: "Shop" },

  /* ===== FLAGS ===== */
  stockstatus: String,
  isactive: { type: Boolean, default: true },
  isapproved: { type: Boolean, default: false },
  isdeleted: { type: Boolean, default: false },

  /* ===== FUTURE PROOF ===== */
  customattributes: mongoose.Schema.Types.Mixed,
  multilayerfilters: mongoose.Schema.Types.Mixed

}, { timestamps: true });

/* ===================== INDEXES ===================== */
itemSchema.index({
  title: "text",
  tags_text: "text",
  brand: 1,
  categoryname: 1
});

module.exports = mongoose.model("Item", itemSchema);

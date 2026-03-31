const Item = require("../models/Item");
const Shop = require("../models/Shop");
const MerkovaCategory = require("../models/Category");
const uploadoncloudinary = require("../utils/Cloudinary");
const mongoose = require("mongoose");

/* ===================== HELPERS ===================== */

const safejson = (value, fallback) => {
  try {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "string") return JSON.parse(value);
    return value;
  } catch {
    return fallback;
  }
};

const safestring = (v, d = "") =>
  typeof v === "string" ? v.trim() : d;

const safenumber = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const safearray = (v) => (Array.isArray(v) ? v : []);

/* ===================== CREATE ITEM ===================== */

exports.createitem = async (req, res) => {
  try {
    const sellerid = req.user.userId;
    const body = req.body;

    /* ================= OWNERSHIP ================= */

    if (!body.shopid || !mongoose.Types.ObjectId.isValid(body.shopid)) {
      return res.status(400).json({ success: false, message: "Invalid shop id" });
    }

    const shop = await Shop.findById(body.shopid);
    if (!shop) {
      return res.status(403).json({ success: false, message: "Unauthorized shop" });
    }

    /* ================= CATEGORY ================= */

    let categorydoc = null;
    if (body.categoryname) {
      categorydoc = await MerkovaCategory.findOneAndUpdate(
        { category: body.categoryname },
        { $setOnInsert: { category: body.categoryname } },
        { upsert: true, new: true }
      );
    }

    /* ================= PRICING ================= */
const pricinginput = safejson(body.pricing, {});

   const baseprice = safenumber(pricinginput.baseprice);
   if(baseprice==0){

    return res.status(400).json("Invalid Base Price")
   }
const discountpercent = Math.min(
  Math.max(safenumber(pricinginput.discountpercent), 0),
  90
);

const discountprice = Math.round((baseprice * discountpercent) / 100);
const currentprice = baseprice - discountprice;

const pricing = {
  baseprice,
  discountpercent,
  discountprice,
  specialpriceduration: pricinginput.specialpriceduration,
  currentprice,
  currency: pricinginput.currency || "BDT"
};

    /* ================= FILE MAP ================= */

    const filemap = {};
    (req.files || []).forEach(file => {
      if (!filemap[file.fieldname]) filemap[file.fieldname] = [];
      filemap[file.fieldname].push(file);
    });

    /* ================= COLOR VARIANTS ================= */

    const colorvariantsinput = safejson(body.colorvariants, []);
    const colorvariants = [];

    for (const variant of colorvariantsinput) {
      const images = [];
      const videos = [];

      const imgfiles = filemap[`images_${variant.colorname}`] || [];
      for (const img of imgfiles) {
        const url = await uploadoncloudinary(img.path);
        if (url) images.push({ url, isprimary: false });
      }
      if (images.length) images[0].isprimary = true;

      const videofile = filemap[`video_${variant.colorname}`]?.[0];
      if (videofile) {
        const url = await uploadoncloudinary(videofile.path);
        if (url) videos.push({ url });
      }

      const sizes = safearray(variant.sizes).map(s => {
        const bp = safenumber(s.price?.baseprice, baseprice);
        const dp = Math.min(Math.max(safenumber(s.price?.discountpercent), 0), 90);
        const dprice = Math.round((bp * dp) / 100);

        return {
          sizename: s.sizename,
          stock: safenumber(s.stock),
          price: {
            baseprice: bp,
            discountpercent: dp,
            discountprice: dprice,
            specialpriceduration:s.price?.specialpriceduration,
            currentprice: bp - dprice
          }
        };
      });

      colorvariants.push({
        colorname: variant.colorname,
        colorhex: variant.colorhex,
        media: { images, videos },
        sizes,
        isactive: true
      });
    }

    /* ================= BRAND MEDIA ================= */

    const brandmediainput = safejson(body.brandmedia, []);
    const brandmedia = [];

    for (let i = 0; i < brandmediainput.length; i++) {
      const block = brandmediainput[i];
      const images = [];
      const videos = [];

      const imgfiles = filemap[`brandmedia_${i}_images`] || [];
      for (const img of imgfiles) {
        const url = await uploadoncloudinary(img.path);
        if (url) images.push({ url });
      }

      const vidfiles = filemap[`brandmedia_${i}_videos`] || [];
      for (const vid of vidfiles) {
        const url = await uploadoncloudinary(vid.path);
        if (url) videos.push({ url });
      }

      brandmedia.push({
        sectiontype: block.sectiontype,
        title: block.title,
        subtitle: block.subtitle,
        images,
        videos,
        maximages: block.maximages || 100
      });
    }

    /* ================= SUBCATEGORIES ================= */

    const subcategories = safejson(body.subcategories, []).map(name => ({
      subcategoryname: [name],
      tags: [],
      filters: {}
    }));

    /* ================= CREATE ITEM ================= */

    const item = await Item.create({
      itemid: `Merkova-${Date.now()}`,

      slug: safestring(body.slug).replace(/^"+|"+$/g, ""),
      title: body.title,
      
      description: body.description,
      highlights: body.highlights,

      tags_text: body.tags_text,
      keywords: safejson(body.keywords, []),

      brand: body.brand,
      brandstory: body.brandstory,
      brandorigin: body.brandorigin,
      modelnumber: body.modelnumber,
      serialnumber: body.serialnumber,
      warranty: body.warranty,
      certifications: safejson(body.certifications, []),
      availableoffers: body.availableoffers,
       isfrozenorglassyproduct:body.isfrozenorglassyproduct,
       IntructionfordangerousProduct:body.IntructionfordangerousProduct,
      deliverytype:body.deliverytype,
      shipsfrom:body.shipsfrom,
      shippingfee:body.shippingfee,
      isdangerous:body.isdangerous,
      categoryid: categorydoc?._id,
      categoryname: body.categoryname,
      subcategories,

      pricing,
      colorvariants,
      brandmedia,
      sizechartimage: safejson(body.sizechartimage, {}),
      attributes: safejson(body.attributes, {}),
      modelinfo: safejson(body.modelinfo, {}),
      shipping: safejson(body.shipping, {}),

      sellerid,
      shopid: body.shopid,

      stockstatus: body.stockstatus || "In Stock",
      isactive: true,
      isapproved: false,
      isdeleted: false
    });

    /* ================= SHOP METRICS ================= */

    await Shop.findByIdAndUpdate(body.shopid, {
      $inc: { "metrics.totalproducts": 1 },
      $addToSet: { shopcategories: body.categoryname }
    });

    res.status(201).json({
      success: true,
      message: "Item created successfully (Merkova Core)",
      item
    });

  } catch (error) {
    console.error("CREATE ITEM ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Create item failed",
      error: error.message
    });
  }
};


// ================= HYBRID RELATED PRODUCTS =================
exports.getrelateditems = async (req, res) => {
  try {
    const { itemid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemid)) {
      return res.status(400).json({ success: false, message: "Invalid item id" });
    }

    // ================= FETCH BASE ITEM =================
    const baseitem = await Item.findOne({
      _id: itemid,
      isdeleted: false,
      isactive: true,
      isapproved: true
    }).lean();

    if (!baseitem) {
      return res.status(404).json({ success: false, message: "Base item not found" });
    }

    const baseprice = baseitem.currentprice;
    const minprice = baseprice * 0.8;
    const maxprice = baseprice * 1.2;

    const basecolors = baseitem.colorvariants.map(c => c.colorname);
    const basesub = baseitem.subcategories?.[0]?.subcategoryname;

    // ================= FETCH CANDIDATES =================
    const candidates = await Item.find({
      _id: { $ne: baseitem._id },
      isdeleted: false,
      isactive: true,
      isapproved: true,
      categoryname: baseitem.categoryname
    })
      .limit(100)
      .lean();

    // ================= SCORE ENGINE =================
    const scored = candidates.map(item => {
      let score = 0;

      // category (already matched)
      score += 30;

      // subcategory
      if (basesub && item.subcategories?.[0]?.subcategoryname === basesub) {
        score += 25;
      }

      // brand
      if (baseitem.brand && item.brand === baseitem.brand) {
        score += 15;
      }

      // price similarity
      if (item.currentprice >= minprice && item.currentprice <= maxprice) {
        score += 15;
      }

      // color similarity
      const itemcolors = item.colorvariants.map(c => c.colorname);
      const commoncolors = itemcolors.filter(c => basecolors.includes(c));
      score += commoncolors.length * 5;

      // season
      if (baseitem.season && item.season === baseitem.season) {
        score += 5;
      }

      // rating boost
      score += (item.rating || 0) * 2;

      return { ...item, relevanceScore: score };
    });

    // ================= SORT & LIMIT =================
    const relateditems = scored
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 12)
      .map(item => ({
        _id: item._id,
        title: item.title,
        currentprice: item.currentprice,
        baseprice: item.baseprice,
        discountpercent: item.discountpercent,
        rating: item.rating,
        colorvariants: item.colorvariants,
        categoryname: item.categoryname
      }));

    res.status(200).json({
      success: true,
      total: relateditems.length,
      relateditems
    });

  } catch (error) {
    console.error("RELATED ITEMS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch related items"
    });
  }
};


exports.getmyshopitems = async (req, res) => {
  try {
    // const sellerid = req.user.userId;
    const { shopid } = req.body;

    const shop = await Shop.findOne({
      _id: shopid
      // "owner.id": sellerid
    });

    if (!shop) {
      return res.status(403).json({
        message: "Unauthorized shop access"
      });
    }

    const items = await Item.find({
      shopid,
      // sellerid,
      isdeleted: false
    })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: items.length,
      items
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products"
    });
  }
};
exports.edititem = async (req, res) => {
  try {
    const { itemid } = req.params;
    const body = req.body;

    if (!mongoose.Types.ObjectId.isValid(itemid)) {
      return res.status(400).json({ message: "Invalid item id" });
    }

    const item = await Item.findOne({ _id: itemid, isdeleted: false });
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    /* ===== SIMPLE FIELDS ===== */
    [
      "title",
      "subtitle",
      "description",
      "highlights",
      "brand",
      "brandstory",
      "brandorigin",
      "modelnumber",
      "serialnumber",
      "warranty",
      "availableoffers",
      "stockstatus",
      "isactive"
    ].forEach(f => {
      if (body[f] !== undefined) item[f] = body[f];
    });

    /* ===== ARRAYS / OBJECTS ===== */
    if (body.keywords) item.keywords = safejson(body.keywords, item.keywords);
    if (body.subcategories) item.subcategories = safejson(body.subcategories, item.subcategories);
    if (body.attributes) item.attributes = safejson(body.attributes, item.attributes);
    if (body.modelinfo) item.modelinfo = safejson(body.modelinfo, item.modelinfo);
    if (body.shipping) item.shipping = safejson(body.shipping, item.shipping);
    if (body.brandmedia) item.brandmedia = safejson(body.brandmedia, item.brandmedia);

    /* ===== PRICING ===== */
    if (body.pricing) {
      const base = safenumber(body.pricing.baseprice, item.pricing.baseprice);
      const discount = Math.min(Math.max(safenumber(body.pricing.discountpercent), 0), 90);

      item.pricing.baseprice = base;
      item.pricing.discountpercent = discount;
      item.pricing.discountprice = Math.round((base * discount) / 100);
      item.pricing.currentprice = base - item.pricing.discountprice;
      item.pricing.currency = body.pricing.currency || item.pricing.currency;
    }

    await item.save();

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item
    });

  } catch (error) {
    console.error("EDIT ITEM ERROR:", error);
    res.status(500).json({ message: "Update failed" });
  }
};



// ================= VARIANT DELETE CONTROLLER =================
exports.deletevariant = async (req, res) => {
  try {
    const sellerid = req.user._id;
    const { itemid, colorname } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemid)) {
      return res.status(400).json({ success: false, message: "Invalid item id" });
    }

    const item = await Item.findOne({ _id: itemid, sellerid, isdeleted: false });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    const colorIndex = item.colorvariants.findIndex(c => c.colorname === colorname);
    if (colorIndex === -1) return res.status(404).json({ success: false, message: "Variant not found" });

    item.colorvariants.splice(colorIndex, 1);
    await item.save();

    res.status(200).json({ success: true, message: "Variant deleted successfully", item });
  } catch (error) {
    console.error("DELETE VARIANT ERROR:", error);
    res.status(500).json({ success: false, message: "Variant deletion failed" });
  }
};

// ================= FULL PRODUCT DELETE CONTROLLER =================
exports.deleteitem = async (req, res) => {
  try {
    const sellerid = req.user._id;
    const { itemid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemid)) {
      return res.status(400).json({ success: false, message: "Invalid item id" });
    }

    const item = await Item.findOne({ _id: itemid, sellerid, isdeleted: false });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    // Soft delete for safety
    item.isdeleted = true;
    await item.save();

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE ITEM ERROR:", error);
    res.status(500).json({ success: false, message: "Product deletion failed" });
  }
};

exports.getallitemsforheadoffice = async (req, res) => {
  try {
    // ================= FETCH ALL ITEMS =================
    const allItems = await Item.find({ isdeleted: false, isactive: true })
      .populate("shopid", "name owner") // optional: show shop name & owner info
      .sort({ createdAt: -1 }); // newest first

    // ================= CATEGORIZE ITEMS =================
    const categorized = {};

    allItems.forEach(item => {
      const cat = item.categoryname || "Uncategorized";
      const subcat = (item.subcategories[0]?.subcategoryname) || "General";

      if (!categorized[cat]) categorized[cat] = {};
      if (!categorized[cat][subcat]) categorized[cat][subcat] = [];

      categorized[cat][subcat].push(item);
    });

    // ================= FETCH 5-STAR ITEMS =================
    const fiveStarItems = allItems.filter(item => item.rating === 5);

    res.status(200).json({
      success: true,
      totalitems: allItems.length,
      categorized,
      justforyou: fiveStarItems,
    });

  } catch (error) {
    console.error("HEAD OFFICE ITEM FETCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch head office items",
      error: error.message
    });
  }
};

// ================= FETCH ITEMS BY CATEGORY (OPTIONAL FILTER) =================
exports.getitemsbycategory = async (req, res) => {
  try {
    const { category, subcategory } = req.query;

    if (!category) return res.status(400).json({ success: false, message: "Category required" });

    const filter = { isdeleted: false, isactive: true, categoryname: category };
    if (subcategory) filter['subcategories.subcategoryname'] = subcategory;

    const items = await Item.find(filter)
      .populate("shopid", "name owner")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: items.length,
      items
    });

  } catch (error) {
    console.error("FETCH ITEMS BY CATEGORY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
};

// ================= FETCH JUST FOR YOU 5-STAR ITEMS =================
exports.getjustforyouitems = async (req, res) => {
  try {
    const items = await Item.find({ isdeleted: false, isactive: true, rating: 5 })
      .populate("shopid", "name owner")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: items.length,
      items
    });
  } catch (error) {
    console.error("FETCH 5-STAR ITEMS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch 5-star items" });
  }
};

exports.getglobalitembyid = async (req, res) => {
  try {
    const { itemid } = req.params;
     
    // ================= ID VALIDATION =================
    if (!mongoose.Types.ObjectId.isValid(itemid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product id"
      });
    }

    // ================= FETCH PRODUCT =================
    const item = await Item.findOne({
      _id: itemid,
      isdeleted: false,
      isactive: true,
      isapproved: true
    })
      .populate("shopid")
      .lean();

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    // ================= INCREASE VIEW =================
    await Item.updateOne(
      { _id: itemid },
      { $inc: { totalviews: 1 } }
    );

    // ================= BUILD VARIANT STRUCTURE =================
    const variants = item.colorvariants.map(color => ({
      colorname: color.colorname,
      colorhex: color.colorhex,
      images: color.images,
      videos: color.videos,
      sizes: color.sizes.map(size => ({
        label: size.label,
        price: size.price || item.currentprice,
        quantity: size.quantity || 0,
        sku: size.sku
      })),
      isactive: color.isactive
    }));

    // ================= CART READY PAYLOAD =================
    const cartpayload = {
      itemid: item._id,
      title: item.title,
      baseprice: item.baseprice,
      discountpercent: item.discountpercent,
      currentprice: item.currentprice,
      currency: item.currency,
      shopid: item.shopid,
      category: item.categoryname,
      variants
      /*
        frontend will send back:
        {
          itemid,
          colorname,
          size,
          quantity
        }
      */
    };

    // ================= RELATED ITEMS =================
    const relateditems = await Item.find({
      _id: { $ne: item._id },
      categoryname: item.categoryname,
      isactive: true,
      isdeleted: false
    })
      .limit(10)
      .select("title currentprice baseprice discountpercent colorvariants rating")
      .lean();

    // ================= JUST FOR YOU =================
    const justforyou = await Item.find({
      rating: 5,
      isactive: true,
      isdeleted: false
    })
      .limit(10)
      .select("title currentprice baseprice discountpercent colorvariants rating")
      .lean();

    // ================= RESPONSE =================
    return res.status(200).json({
      success: true,
      message: "Product details fetched successfully (Global PDP)",
      product: {
        _id: item._id,
        title: item.title,
        description: item.description,
        brand: item.brand,
        specification: item.specification,
        warranty: item.warranty,
        availableoffers: item.availableoffers,
        rating: item.rating,
        totalreviews: item.totalreviews,
        totalviews: item.totalviews + 1,
        category: item.categoryname,
        age: item.age,
        sex: item.sex,
        material: item.material,
        season: item.season,
        pricing: {
          baseprice: item.baseprice,
          discountpercent: item.discountpercent,
          discountprice: item.discountprice,
          currentprice: item.currentprice,
          currency: item.currency
        },
        seller: item.shopid,
        variants
      },
      cartpayload,
      relateditems,
      justforyou
    });

  } catch (error) {
    console.error("GLOBAL ITEM FETCH ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product details"
    });
  }
};


// ================= GET SHOP BY ID (PUBLIC / GLOBAL) =================
exports.getshopbyid = async (req, res) => {
  try {
    const { shopid } = req.params;

    // ================= ID VALIDATION =================
    if (!mongoose.Types.ObjectId.isValid(shopid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop id"
      });
    }

    // ================= FETCH SHOP =================
    const shop = await Shop.findOne({
      _id: shopid,
      approvalstatus: "approved",
      visibility: true
    })
      .select("-verification -bank -finance -membership -owner.backupcode")
      .lean();

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found"
      });
    }

    // ================= FETCH SHOP ITEMS =================
    const items = await Item.find({
      shopid: shop._id,
      isdeleted: false,
      isactive: true,
      isapproved: true
    })
      .sort({ createdAt: -1 })
      .select(
        "title currentprice baseprice discountpercent rating totalreviews colorvariants categoryname"
      )
      .lean();

    // ================= RESPONSE =================
    return res.status(200).json({
      success: true,
      message: "Shop fetched successfully",
      shop: {
        _id: shop._id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        storetype: shop.storetype,
        ShopCapacity: shop.ShopCapacity,
        specialfor: shop.specialfor,
        tags: shop.tags,

        media: {
          thumbnail: shop.thumbnail,
          profileimage: shop.profileimage,
          coverimage: shop.coverimage,
          gallery: shop.gallery,
          video: shop.video
        },

        address: shop.address,

        rating: shop.rating,
        metrics: shop.metrics,
        badges: shop.badges,

        categories: shop.shopcategories,
        subcategories: shop.shopsubcategories,

        owner: {
          name: shop.owner?.name,
          email: shop.owner?.email,
          mobile: shop.owner?.mobile,
          Gender: shop.owner?.Gender
        },

        createdAt: shop.createdAt
      },
      totalproducts: items.length,
      products: items
    });

  } catch (error) {
    console.error("GET SHOP BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch shop",
      error: error.message
    });
  }
};


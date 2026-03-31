const mongoose = require("mongoose");
const Category = require("../models/Categorycreator.js");
const uploadoncloudinary = require("../utils/Cloudinary");

// =======================================================
// 🔹 CREATE MAIN CATEGORY (WITH IMAGE)
// =======================================================
exports.createcategory = async (req, res) => {
  try {
    const { name, navigatelink, serial, isactive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    let imageurl = null;
    if (req.file) {
      imageurl = await uploadoncloudinary(req.file.path);
    }

    const category = await Category.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      image: imageurl,
      navigatelink,
      serial: serial ?? 0,
      isactive: isactive ?? true,
      createdby: req.user?.id
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category
    });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category"
    });
  }
};



// =======================================================
// 🔹 ADD SUB CATEGORY
// =======================================================
exports.addsubcategory = async (req, res) => {
  try {
    const { categoryid } = req.params;
    const { name, serial, isactive,navigatelink, } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name required"
      });
    }

    let imageurl = null;
    if (req.file) {
      imageurl = await uploadoncloudinary(req.file.path);
    }

    const category = await Category.findById(categoryid);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    category.subcategories.push({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      image: imageurl,
        navigatelink,
      serial: serial ?? 0,
      isactive: isactive ?? true
    });

    await category.save();

    res.status(200).json({
      success: true,
      message: "Subcategory added successfully",
      category
    });
  } catch (error) {
    console.error("ADD SUBCATEGORY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to add subcategory" });
  }
};



// =======================================================
// 🔹 ADD BRAND
// =======================================================
exports.addbrand = async (req, res) => {
  try {
    const { categoryid } = req.params;
    const { name, isactive,navigatelink } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Brand name required" });
    }

    let imageurl = null;
    if (req.file) {
      imageurl = await uploadoncloudinary(req.file.path);
    }

    const category = await Category.findById(categoryid);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    category.brands.push({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      image: imageurl,
      navigatelink,
      isactive: isactive ?? true
    });

    await category.save();

    res.status(200).json({
      success: true,
      message: "Brand added successfully",
      category
    });
  } catch (error) {
    console.error("ADD BRAND ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to add brand" });
  }
};



// =======================================================
// 🔹 ADD MATERIAL
// =======================================================
exports.addmaterial = async (req, res) => {
  try {
    const { categoryid } = req.params;
    const { name, isactive,navigatelink } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Material name required" });
    }

    const category = await Category.findById(categoryid);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    category.materials.push({
      name,
      navigatelink,
      isactive: isactive ?? true
    });

    await category.save();

    res.status(200).json({
      success: true,
      message: "Material added successfully",
      category
    });
  } catch (error) {
    console.error("ADD MATERIAL ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to add material" });
  }
};



// =======================================================
// ✏️ EDIT ANYTHING (CATEGORY / SUB / BRAND / MATERIAL)
// =======================================================
exports.editcategory = async (req, res) => {
  try {
    const { categoryid } = req.params;
    const update = { ...req.body };

    if (req.file) {
      update.image = await uploadoncloudinary(req.file.path);
    }

    const category = await Category.findByIdAndUpdate(
      categoryid,
      { $set: update },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category
    });
  } catch (error) {
    console.error("EDIT CATEGORY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update category" });
  }
};



// =======================================================
// 🔄 TOGGLE ACTIVE / DEACTIVE (CATEGORY)
// =======================================================
exports.togglecategory = async (req, res) => {
  try {
    const { categoryid } = req.params;

    const category = await Category.findById(categoryid);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    category.isactive = !category.isactive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.isactive ? "activated" : "deactivated"}`,
      category
    });
  } catch (error) {
    console.error("TOGGLE CATEGORY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};



// =======================================================
// 🗑️ DELETE SUB / BRAND / MATERIAL (BY ID)
// =======================================================
exports.deletesubdocument = async (req, res) => {
  try {
    const { categoryid, type, subid } = req.params;

    const category = await Category.findById(categoryid);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    if (type === "subcategory") {
      category.subcategories.id(subid)?.remove();
    }
    if (type === "brand") {
      category.brands.id(subid)?.remove();
    }
    if (type === "material") {
      category.materials.id(subid)?.remove();
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: `${type} removed successfully`,
      category
    });
  } catch (error) {
    console.error("DELETE SUB DOCUMENT ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
};



// =======================================================
// 📋 ADMIN – GET ALL CATEGORIES (FULL TREE)
// =======================================================
exports.getallcategoriesadmin = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ serial: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      total: categories.length,
      categories
    });
  } catch (error) {
    console.error("GET ALL CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load categories"
    });
  }
};



// =======================================================
// 🌍 USER – GET ACTIVE CATEGORIES ONLY
// =======================================================
exports.getactivecategories = async (req, res) => {
  try {
    const categories = await Category.find({ isactive: true })
      .sort({ serial: 1 });

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error("GET ACTIVE CATEGORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load categories"
    });
  }
};
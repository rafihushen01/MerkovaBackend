const mongoose = require("mongoose");


const SubnavSchema = new mongoose.Schema(
{
title: {
type: String,
trim: true,
required: true
},


description: {
type: String,
trim: true
},


// Temu-style 4 sides
side: {
type: String,
enum: ["left", "center", "right", "bottom"],
required: true
},


// Icon configuration (safe & mismatch-free)
icon: {
type: {
type: String,
enum: ["lucide", "react-icons"],
required: true
},


library: {
type: String,
enum: ["fa", "fc", "md", "io", "gi", "hi"],
required: true
},


name: {
type: String,
required: true
}
},


navigation_link: {
type: String,
required: true
},


order: {
type: Number,
default: 0
},


is_active: {
type: Boolean,
default: true
},


created_by: {
type: mongoose.Schema.Types.ObjectId,
ref: "Admin"
}
},
{ timestamps: true }
);


module.exports = mongoose.model("Subnav", SubnavSchema);
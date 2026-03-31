const Subnav = require("../models/SubNav.js");





// ✅ DELETE SUBNAV (PERMANENT)
exports.deletesubnav = async (req, res) => {
try {
const deleted = await Subnav.findByIdAndDelete(req.params.id);


if (!deleted) {
return res.status(404).json({
success: false,
message: "Subnav item not found"
});
}


res.status(200).json({
success: true,
message: "Subnav item deleted permanently"
});
} catch (error) {
res.status(500).json({
success: false,
message: error.message
});
}
};




// ✅ TOGGLE ACTIVE / INACTIVE
exports.togglesubnav = async (req, res) => {
try {
const subnav = await Subnav.findById(req.params.id);


if (!subnav) {
return res.status(404).json({
success: false,
message: "Subnav item not found"
});
}


subnav.is_active = !subnav.is_active;
await subnav.save();


res.status(200).json({
success: true,
message: "Subnav status updated",
data: subnav
});
} catch (error) {
res.status(500).json({
success: false,
message: error.message
});
}
};
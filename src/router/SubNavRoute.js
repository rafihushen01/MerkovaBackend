const express = require("express");
const router = express.Router();


const {
createsubnav,
getsubnav,
updatesubnav,
deletesubnav,
togglesubnav
} = require("../controller/SubNavController");


const { IsAuth } = require("../middlewares/IsAuth.js");


// 🔐 SUPERADMIN
router.post("/create", IsAuth, createsubnav);
router.put("/update/:id", IsAuth, updatesubnav);
router.delete("/delete/:id", IsAuth, deletesubnav);
router.patch("/toggle/:id", IsAuth, togglesubnav);


// 🌍 PUBLIC
router.get("/", getsubnav);


module.exports = router;
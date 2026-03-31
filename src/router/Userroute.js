
const { signup, signin, signout,  resetPassword, forgotPassword, getCurrentUser, sellersignup,sendsellerotp,verifysellerotp,googlesignup, googlelogin} = require("../controller/AuthController");

const express = require("express");
const isAuth=require("../middlewares/IsAuth.js")
const router=express.Router();
router.post("/signup",signup)
router.post("/signin", signin)
router.post("/signout",signout)
router.post("/forgetpass",forgotPassword)
 router.post("/resetpass",resetPassword)
 router.get("/getcurrent",isAuth,getCurrentUser)
 router.post("/sellersignup",sellersignup)
router.post("/sellersendotp",sendsellerotp)
router.post("/sellerverifyotp",verifysellerotp)
router.post("/googlesignup",googlesignup)
router.post("/googlelogin",googlelogin)
module.exports=router
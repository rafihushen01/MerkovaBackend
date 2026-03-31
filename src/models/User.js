const { default: mongoose } = require("mongoose");

const userschema=new mongoose.Schema({
    name:{


        type:String
    },
    email:{

        type:String,
        
        unique:true
    },
    sellernewgmailotp:{

        type:String
    },
    sellernewgmailotpisverfied:{

        type:Boolean
    },
   sellerchangeemailchangetime: {
  type: Date,
  default: null
}
,
    password:{

        type:String
    },
    sellerresetotp:{

        type:String
    },
    role:{

        type:String,
        enum:["User",'Seller',"AffilateAccount","Admin","SubAdmin",'SuperAdmin',"HeadSuperadmin"],
        default:"User"
    },
    sellerotp:{

        type:String
    },
    gender:{
        type:String,
        enum:["Male","Female","Other"]
    },
      maleavatar:{

    type:String,
    default:"https://xaydungso.vn/bai-viet-khac/top-99-male-avatar-icon-dang-gay-sot-tren-mang-vi-cb.html"
   },
   femaleavatar:{

    type:String,
    default:"https://cdn-icons-png.flaticon.com/512/65/65581.png"
   },
   othersavatar:{

    type:String,
    default:"https://www.vecteezy.com/vector-art/13659405-woman-beard-transgender-lgbt-mtf-avatar-clip-art-icon"
   },
   avatar: {
       path:{

        type:String
       }
    },
// otp fields (existing)
customerssignupotp: { type: String },
coustomersignupotpisverified: { type: Boolean, default: false },
coustomersignupotpisexpires: { type: Date },

customerssigninotp: { type: String },
coustomersigninotpisverified: { type: Boolean, default: false },
coustomersigninotpisexpires: { type: Date },

// 🔥 NEW SECURITY CONTROL FIELDS
signupotpresendcount: { type: Number, default: 0 },
signinotpresendcount: { type: Number, default: 0 },

signinwrongotpcount: { type: Number, default: 0 },

otpsuspendeduntil: { type: Date }, // 1 hour suspension
permanentlyblocked: { type: Boolean, default: false },

blockeddevices: [{ type: String }], // device fingerprint / ip hash

    mobile:{

        type:String
    },
    supverificationotp:{

        type:String
    },
    superadminotpexpires:{

        type:String
    },
   address: [
  {
    district: String,
    upzilla: String,
    city: String,
    state: String,
    zip: String,
    fulladdress: String,
  }
]

    ,
    mertoken:{
        type:Number,
        default:0
    },
      

     otp:{

        type:Number,
        default:null
     },
     isAdmin:{


        type:Boolean,

     },
     iscreatedbysuperadmin:{

        type:Boolean,

     },
     serialnoofadmin:{

        type:Number
     },
     

     resetotp:{

        type:Number,
        default:null
     },
     isverify:{

        type:Boolean,
        default:false
     },
  // Add this field inside your userschema
resetOtpExpires: {
    type: Date,
    default: null
},
 followedshops: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    }]












},{timestamps:true})
const user=new mongoose.model("User",userschema)
module.exports=user;
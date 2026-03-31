const orderschema = new mongoose.Schema(
{
  shopid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    index: true
  },

  sellerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  totalamount: Number,

  orderstatus: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
    index: true
  },
    orderdate:{

      type:Date
    },
  deliveredat: Date,
  isdelivered:{

    type:Boolean,
    default:false
  },
coustomerdetails:{
       type: mongoose.Schema.Types.ObjectId,
    ref: "User"

   }
},
{
  timestamps: true
})

module.exports = mongoose.model("Order", orderschema)

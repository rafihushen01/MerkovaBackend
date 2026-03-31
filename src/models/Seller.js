const mongoose =require("mongoose")
const sellerschema=new mongoose.Schema({
firstname:{

    type:String,
},
lastname:{

    type:String
},
type:String


},
email:{

    type:String,
    unique:true
},
password:{

    type:String
},
})

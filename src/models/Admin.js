const adminschema = new mongoose.Schema({
  name:{

    type:String,

  },
  email:{

    type:String
  },
  password:{
    type:String
  },
  isadmin:{

    type:Boolean
  },
  mobile:{

    type:String,

  },
  serialno:{

    type:Number
  },
  gender:{
    type:String,
    enum:["Male","Female","Other"]
  },
  iscreatedbysuperadmin:{

    type:Boolean
  },
 









},{timestamps:true})
const admin=new mongoose.model("Admin",adminschema)
module.exports=admin
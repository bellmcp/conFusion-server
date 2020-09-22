var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new Schema({
  firstname: {
    type: String,
    default: "",
  },
  lastname: {
    type: String,
    default: "",
  },
  facebookId: String,
  admin: {
    type: Boolean,
    default: false,
  },
});

userSchema.plugin(passportLocalMongoose);

// module.exports = mongoose.model("user", User);
var Users = mongoose.model("User", userSchema);
module.exports = Users;

// var Promotions = mongoose.model("Promotion", promotionSchema);
// module.exports = Promotions;

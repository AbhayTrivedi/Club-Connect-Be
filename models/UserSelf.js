const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const userSchema = new Schema({
//    email: {
//       type: String,
//       required: true,
//       unique: true
//    },
//    password: {
//       type: String,
//       required: true
//    }
// });

const userSchema = new mongoose.Schema({
   username: { type: String},
   password: { type: String},

});

module.userSchema = mongoose.model("user", userSchema); ;

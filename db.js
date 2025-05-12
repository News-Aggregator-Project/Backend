const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const User = new Schema({
    name:String,
    email:String,
    password:String
})

const userModel = mongoose.model('users',User);
module.exports={
    UserModel:userModel,
}
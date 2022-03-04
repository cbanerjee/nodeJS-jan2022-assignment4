const { Int32 } = require("bson");
const mongoose = require("mongoose");
    Schema = mongoose.Schema;

var OrderModel = new Schema({
    name : {type:String},
    address : {type:String},
    email : {type:String},
    item : {type:String},
    item_price : {type:String},
    orderdate : {type:String},
    item_quantity : {type:String}
});

module.exports = mongoose.model('order',OrderModel,'orderList');
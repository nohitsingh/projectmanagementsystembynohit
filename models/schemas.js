var mongoose = require('mongoose');
var schema = mongoose.Schema;
const crypto = require("crypto")
let menuSchema = new schema({
    name: {type:String, require:true},
    icon: {type:String, require:true},
    menuUrl: {type:String, require:true},
    image: {type:String},
    entryDate: {type:Date, default:Date.now}
});

let usersSchema = new schema({
    pwdresettoken : {type:String,        select : false
    },
    fname: {type:String, require:true},
    lname: {type:String, require:true},
    email: {type:String, require:true},
    pwd: {type:String, require:true},
    entryDate: {type:Date, default:Date.now},
});

usersSchema.methods.createpasswordResetToken=function(){
    const resetToken = crypto.randomBytes(32).toString('hex');//create random token
    this.pwdresettoken=crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    this.save()

    return resetToken; // we sent the unencrypted email token
}

let menu = mongoose.model('menu', menuSchema, 'menu');
let users = mongoose.model('users', usersSchema, 'users');
let mySchemas = {'menu':menu, 'users':users};

module.exports = mySchemas;
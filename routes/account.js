var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var schemas = require('../models/schemas.js');
schemas
router.post('/:email', async(req, res) => {
let usersResult = await schemas.users.findOneAndUpdate({email:req.body.email},{fname:req.body.pwdInput
    ,lname:req.body.emailInput},{new:true})
    console.log(req)
    res.redirect('/')
});

module.exports = router;
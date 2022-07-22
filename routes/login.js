var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var schemas = require('../models/schemas.js');

router.get('/', (req, res) => {
  res.render('login', { title: 'Login', loggedIn: false, error: null });
});

router.get('/new-acct', (req, res) => {
  res.render('new-acct', { title: 'New Account', loggedIn: false, error: null });
});

router.post('/', async (req, res) => {
  let email = req.body.emailInput;
  let pass = req.body.pwdInput;
  let loginSuccess = false;
  let sesh = req.session;
  sesh.loggedIn = false;

  let users = schemas.users;
  let qry = { email: email };

  if (email != '' && pass != '') {
    // find account using email
    var usersResult = await users.findOne(qry).then(async (data) => {
      if (data) {
        // check if password matches
        let passResult = await bcrypt.compare(pass, data.pwd).then((isMatch) => {
          if (isMatch) {
            // ok - set sessions
            sesh.loggedIn = true;
            // sech.usr = usersResult
            loginSuccess = true;
          }
        });
      }
    });
  }

  if (loginSuccess === true) {
    console.log(usersResult)
  //  return res.render('index', { title: 'Login', loggedIn: true});

     res.redirect('/?usr='+email);
  } else {
    return res.render('login', { title: 'Login', loggedIn: false, error: 'EmailID or Password does not match. Try Again!' });
  }
});

router.post('/new', async (req, res) => {
  let fname = req.body.fname;
  let lname = req.body.lname;
  let email = req.body.emailInput;
  let pass = req.body.pwdInput;
  const checkEmail = await schemas.users.find({ email: email });
  const checkCount = checkEmail.length;

  if (email != '' && pass != '') {
    if (checkCount > 0) {
      res.render('new-acct', { title: 'signin', loggedIn: false, error: 'email already in use' });
    }
    else {
      let users = schemas.users;
      let qry = { email: email };

      let userSearch = await users.findOne(qry).then(async (data) => {
        if (!data) {
          // password encryption
          let saltRounds = 10;
          let passSalt = await bcrypt.genSalt(saltRounds, async (err, salt) => {
            let passHash = await bcrypt.hash(pass, salt, async (err, hash) => {
              let acct = {fname: fname, lname: lname, email: email, pwd: hash, level: 'admin' };
              let newUser = new schemas.users(acct);
              let saveUser = await newUser.save();
            });
          });
        }
      });
    }

    res.render('login', { title: 'Login', loggedIn: false, error: 'Please login with your new account' });
  } else {
    res.render('new-acct', { title: 'New Account', loggedIn: false, error: 'All fields are required. Please check and try again.' });
  }
});


module.exports = router;

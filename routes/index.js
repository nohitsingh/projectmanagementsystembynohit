var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var http = require('http');
var isUp = require('isup');
var jwt = require('jsonwebtoken');
var schemas = require('../models/schemas.js');
const sendEmail = require('../email')
const crypto = require("crypto")
var bcrypt = require('bcrypt');


/* GET home page. */
router.get('/', async (req, res) => {
  let sesh = req.session;

  if (!sesh.loggedIn) {
    res.redirect('/login');
  } else {

    let menu = schemas.menu;
    let sesh = req.session;
    let menuResult = await menu.find({}).then((menuData) => {
      res.render('index', { title: 'Menu App', data: menuData, tap: menuData.length, search: '', loggedIn: sesh.loggedIn });
    });
  }
});

router.get('/profile', async (req, res) => {
  let sesh = req.session;

  if (!sesh.loggedIn) {
    res.redirect('/login');
  } else {

    let users = schemas.users;
    let sesh = req.session;

    let usersResult = await users.find({}).then((usersData) => {
      res.render('profile', { title: 'Menu App', data: usersData, fname: usersData.fname, search: '', loggedIn: sesh.loggedIn });
    });
  }
});

let use = {
  id: schemas.users.lname,
  email: schemas.users.email,
  password: schemas.users.pwd
};

const JWT_SECRET = 'some super secret'

router.get('/forgot', (req, res) => {
  res.render('forgot', { title: '', loggedIn: false, error: null });
});

router.post('/forgot', async (req, res) => {

  var { email } = req.body;
  console.log(email)
  //get the user based on posted email
  const usr = await schemas.users.findOne({ email })

  if (!usr) {
    res.render('forgot', { error: 'User not found. Try Again!' });
    return;
  }

  const secret = JWT_SECRET + usr.password;
  const payload = {
    email: usr.email,
    id: usr.id
  };
  const token = usr.createpasswordResetToken();
  const link = `${req.protocol}://${req.get('host')}/reset/${token}`;
  const html =
    ` <div style="display:flex;align-items:center; flex-direction:column" >
  <h3 style="margin-bottom: -10px;">Hello ! </h3>
  <h4>Please reset your password </h4>
  <a href= "${link}" style="color:blue">link </a>
  <h3>thank you</h3>
  </div> 
  `
  try {
    await sendEmail({
      email: usr.email,
      subject: `Your password reset token `,
      html
    })
    return res.render('forgot', { error: 'password reset link has been sent to your Email' });

  } catch (err) {
    console.log(err)
    return res.render('forgot', { error: 'there was an error sending the email' });
  }

}
);

router.get('/reset/:token', async (req, res) => {
  const { token } = req.params
  console.log(token)
  res.render('reset', { title: 'reset', data: token });

});

router.post('/reset/:token', async (req, res) => {
  const { token } = req.params

  console.log(token)
  const hashedToken = crypto
    .createHash('sha256')
    .update(token.trim())
    .digest('hex');
  console.log(hashedToken)
  const usr = await schemas.users.findOne({ pwdresettoken: hashedToken }
  ).select("+pwdresettoken")

  if (!usr) {
    res.render('forgot', { error: 'Link Expired. Try again!!' });
    return;
  }
  usr.pwd = await bcrypt.hash(req.body.password, 10);
  usr.pwdresettoken = undefined;
  await usr.save();
  res.render('login', { error: 'Password changed. Please login ' });
  return;


});

router.get('/list', async (req, res) => {
  let menu = schemas.menu;
  let sesh = req.session;
  if (!sesh.loggedIn) {
    res.redirect('/login');
  } else {

    let menuResult = await menu.find({}).then((menuData) => {
      console.log(menuData)
      res.render('applications', { title: 'Menu App', data: menuData, search: '', loggedIn: sesh.loggedIn });
    });
  }
});

var emailad = ""
router.get('/account/:email', async (req, res) => {

  console.log("params", req.params)

  let users = schemas.users;
  let sesh = req.session;
  if (!sesh.loggedIn) {
    res.render('login', { title: 'Edit', loggedIn: false, error: 'not logged in ' });
  } else {

    let usersResult = await users.findOne(req.params).then((usersData) => {
      console.log("usr", usersData)
      res.render('account', { title: 'Menu App', data: usersData, fname: usersData.fname, lname: usersData.lname, search: '', loggedIn: sesh.loggedIn });

    })
  };
});

router.get('/table', async (req, res) => {
  let menu = schemas.menu;
  let sesh = req.session;
  if (!sesh.loggedIn) {
    res.redirect('/login');
  } else {

    let menuResult = await menu.find({}).then((menuData) => {
      res.render('tables', { title: 'Menu App', data: menuData, search: '', loggedIn: sesh.loggedIn });
    });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

router.post('/q', async (req, res) => {
  let menu = schemas.menu;
  let q = req.body.searchInput;
  let menuData = null;
  let sesh = req.session;
  let qry = { name: { $regex: '^' + q, $options: 'i' } };

  if (q != null) {
    let menuResult = await menu.find(qry).then((data) => {
      menuData = data;
    });
  } else {
    q = 'Search';
    let menuResult = await menu.find({}).then((data) => {
      menuData = data;
    });
  }

  res.render('index', { title: 'Menu App', data: menuData, search: q, loggedIn: sesh.loggedIn });
});

module.exports = router;

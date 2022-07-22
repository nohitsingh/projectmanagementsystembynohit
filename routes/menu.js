var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var multer = require('multer')
var schemas = require('../models/schemas.js');

router.use(express.static(__dirname+"./img/"));

var Storage = multer.diskStorage({
    destination:"./img/",
    filename: (req, file, cb) =>{
      console.log(file)
      cb(null, file.fieldname+"_"+Date.now() + path.extname(file.originalname))
    }
  }); 

var upload = multer({
    storage:Storage
}).single('file');
  

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/:id', async(req, res) => {
    let sesh = req.session;

    if (!sesh.loggedIn) {
        res.render('menu', {title:'Edit', loggedIn:false, error:'Invalid Request'});
    } else {
        let id = req.params.id;
        let err = '';

        let menu = schemas.menu;
        let qry = {_id:id};

        let itemResult = await menu.find(qry).then( (itemData) => {
            if (itemData == null) {
                err = 'Invalid ID';
            }

            res.render('menu', {title:'Edit Menu', item:itemData, loggedIn:sesh.loggedIn, error:err});
        });
    }
});

router.get('/delete/:id', async(req, res) => {
    let sesh = req.session;

    if (!sesh.loggedIn) {
        res.redirect('/login');
    } else {
        let menu = schemas.menu;
        let menuId = req.params.id;
        let qry = {_id:menuId};
        let deleteResult = await menu.deleteOne(qry);
        res.redirect('/list');
    }
});

router.post('/save', upload, async(req, res) => {
    let sesh = req.session;

    if (!sesh.loggedIn) {
        res.redirect('/login');
    } else {
        console.log(req.body)
        let menuId = req.body.menuId;
        let menuName = req.body.menuName;
        let menuIcon = req.body.menuIcon;
        let menuUrl = req.body.menuUrl;
        let image = req.file.filename;
        let menu = schemas.menu;

        let qry = {_id:menuId};

        let saveData = {
            $set: {
                name: menuName,
                icon: menuIcon,
                menuUrl: menuUrl,
                image: image
            }
        }

        let updateResult = await menu.updateOne(qry, saveData);

        res.redirect('/list');
    }
});

router.post('/new', upload, async(req, res) => {
    let sesh = req.session;

    if (!sesh.loggedIn) {
        res.redirect('/login');
    } else {
        console.log(req.body)
        let menuName = req.body.menuName;
        let menuIcon = req.body.menuIcon;
        let menuUrl = req.body.menuUrl;
        let image = req.file.filename;
        let menu = schemas.menu;

        let qry = {name:menuName};

        let searchResults = await menu.findOne(qry).then( async(userData) => {
            if (!userData) {
                // ok to add menu
                let newMenu = new schemas.menu({
                    name: menuName,
                    icon: menuIcon,
                    menuUrl: menuUrl,
                    image: image
                });

                let saveMenu = await newMenu.save();
            }
        });

        res.redirect('/list');
    }
});


module.exports = router;
const express = require('express');
const Users = require('../models/users');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const path = require('path');
// Image upload configuration
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var uploadDir = "./uploads";
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    var fileExtension = file.originalname.split(".").pop();
    var filename =
      file.fieldname + "_" + Date.now() + "_" + file.originalname;
    cb(null, filename.replace("." + fileExtension, "") + "." + fileExtension);
  }
});

var upload = multer({
  storage: storage
}).single("image");

// Route for adding a user
router.post('/add', upload, async (req, res) => {
  const user = new Users({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename
  });

  try {
    await user.save();
    req.session.message = {
      type: 'success',
      message: 'User added successfully',
    };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Home page route
router.get("/", (req, res) => {
  res.render('index', { title: 'HomePage' });
});

// Add user page route
router.get("/add_user", (req, res) => {
  res.render('add_user', { title: 'AddUser' });
});

module.exports = router;

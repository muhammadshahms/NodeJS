const express = require('express');
const Users = require('../models/users');
const multer = require('multer');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { log } = require('console');
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
  Users.find()
    .exec()
    .then(users => {
      res.render("index", {
        title: "Home Page",
        users: users

      });
    })
    .catch(err => {
      res.json({ message: err.message });
    });
});

// Add user page route
router.get("/add_user", (req, res) => {
  res.render('add_user', { title: 'AddUser' });
});

router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  Users.findById(id).exec()
    .then(user => {
      if (user == null) {
        res.redirect('/');
      } else {
        res.render('edit_user', {
          title: 'Edit User',
          user: user
        });
      }
    })
    .catch(err => {
      res.redirect('/');
    });
});

router.post("/update/:id", upload, (req, res) => {
  let id = req.params.id;
  let new_image = "";

  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }

  const updateData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: new_image
  };

  Users.findByIdAndUpdate(id, updateData)
    .then(result => {
      req.session.message = {
        type: "success",
        message: "User updated successfully"
      };
      res.redirect("/");
    })
    .catch(err => {
      res.json({ message: err.message, type: 'danger' });
    });
});


router.get("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Users.findByIdAndRemove(id);

    if (result.image != "") {
      try {
        fs.unlinkSync("./uploads/" + result.image);
      } catch (err) {
        console.log(err);
      }
    }

    req.session.message = {
      type: "danger",
      message: "User deleted successfully"
    };
  } catch (err) {
    res.json({ message: err.message });
  }

  res.redirect("/");
});

module.exports = router;

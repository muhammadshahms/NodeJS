const express = require('express');

const router = express.Router();
router.get("/",(req,res)=>{
    res.render('index',{title: 'HomePage'})
})
router.get("/add_user",(req,res)=>{
    res.render('add_user',{title: 'AddUser'})
})



module.exports=router;

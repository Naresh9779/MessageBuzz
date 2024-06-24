const express = require('express');
const router=express.Router();
const userController=require('../controllers/userController');
const chatController=require('../controllers/chatController');

router
.post('/save-chat',chatController.saveChat)
.delete('/delete-chat',chatController.deleteChat)


module.exports=router;
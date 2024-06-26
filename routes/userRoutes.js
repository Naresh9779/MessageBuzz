const express=require('express');
const userController = require('../controllers/userController');
const path=require('path');

const router=express.Router();
const cookieParser=require('cookie-parser');
router.use(cookieParser());




router.get('/logout',userController.protect,userController.logOut)

router
.route('/signup')
.post(userController.upload,userController.createUser)


router
.route('/login')
.get(userController.loggedIn)
.post(userController.loginIn);

router.patch('/updateMe',userController.protect,userController.upload, userController.updateMe)
router.patch('/updatePassword',userController.protect,userController.updatePassword)
router.put('/forgot-password',userController.forgotPassword);
router.patch('/reset-password/:token',userController.resetPassword)
router.patch('/addFriend',userController.protect,userController.addFriend)


module.exports=router;
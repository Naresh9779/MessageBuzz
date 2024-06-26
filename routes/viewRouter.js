const express = require('express');
const router=express.Router();
const viewController=require('../controllers/viewController')
const userController=require('../controllers/userController');



router
.get('/signup',userController.loggedIn,viewController.isAuthenticated,viewController.signup)
.get('/login',userController.loggedIn,viewController.isAuthenticated,viewController.login)
.get('/*',userController.loggedIn,viewController.homePage)
.get('/dashboard',userController.protect,viewController.dashboard)

.get('/setting',userController.protect,viewController.setting)
.get('/forgotPassword',viewController.forgotPassword)
.get('/resetPassword/:token',viewController.resetPassword)
.get('/friends',userController.protect,viewController.friends)







module.exports=router;

const User = require('../models/userModel');
const catchAsync=require('../utils/catchAsync');
const jwt=require('jsonwebtoken');
const AppError=require('../utils/appError');
const multer=require('multer')
const {promisify}=require('util');
const Email=require('../utils/email');
const crypto = require('crypto');
const {S3}=require('aws-sdk');
const dotenv=require('dotenv');

dotenv.config({path:'../config.env'});




// const multerStorage=multer.diskStorage({destination:(req,file,cb)=>
//   {cb(null,'public/img/users');

// },
// filename:(req,file,cb)=>{
//   const ext=file.mimetype.split('/')[1];
//   const fileName=`user-${Date.now()}.${ext}`;
//   cb(null,fileName);
// }});

const storage=multer.memoryStorage();


const fileFilter=(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        const ext=file.mimetype.split('/')[1];
       const fileName=`user-${Date.now()}.${ext}`;
          file.fileName=fileName;
        cb(null,true);
    }else{
        cb(new AppError('Not an image! Please upload only images',400),false);
    }
}


const uploadImg=multer({
    storage,
    fileFilter,
    
    limits:{fileSize:1000000000000}

})

exports.upload=uploadImg.single('image');




s3Upload=async(req,res,next)=>{
    console.log(req.file.fileName);

  const s3=new S3({
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
        region:process.env.AWS_REGION
    });
    const params={
        Bucket:process.env.aws_bucket_name,
        Key:`img/users/${req.file.fileName}`,
        Body:req.file.buffer,
        
    };
    await s3.upload(params).promise();
   
}
    











const signToken=id=>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});

};
const createAndSendToken=(user,statusCode,res)=>{
    const token =signToken(user._id);
    // console.log(process.env.JWT_EXPIRES_IN);
    cookieOptions={
        expires:new Date(Date.now()+90*24*60*60*1000),
        httpOnly:true
    }
    cookieOptions.secure=true
    res.cookie('jwt',token,cookieOptions);
    res.status(statusCode).json(
        {
         status: 'success',
         token,
        
    
        } );


}

exports.createUser=catchAsync(async(req,res,next)=>{
   
  if(!req.file){
    return next(new AppError('Please upload an image',400));
  }
    const nUser={
       name:req.body.name,
       email:req.body.email,
       password:req.body.password,
       image:req.file.fileName

    }

    const newUser =await User.create(nUser);
    await  s3Upload(req);
    

     createAndSendToken(newUser,201,res)
     await new Email(newUser).sendWelcome();

   
  

    
 
})


exports.logOut=(req, res, next) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now()*1000),
        httpOnly: true
    });
    res.status(200).json({ status:'success' });
}

exports.loginIn=catchAsync(async(req,res,next)=>{

    const {email,password}=req.body;
    if(!email||!password)
    {
        return next(new AppError('Please provide email and password',400));
    }
    const user= await User.findOne({email}).select('+password');
    if(!user||! await user.confirmPassword(password,user.password))
    {
        return next(new AppError('Invalid email Id Or Password',401));

    }
    
    createAndSendToken(user,201,res);
    await new Email(user).loginSucessfully();

});

exports.loggedIn=async(req, res, next)=>{

    if(req.cookies.jwt)
    try{
    {
      
        const decoded=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
        //  console.log(decoded);
        const currentUser= await User.findById(decoded.id);

        if(!currentUser)
        {
            return next()
        }
        if (currentUser.changedPasswordAfter(decoded.iat)
        ){
    return next();
    
        };
        req.user = currentUser;
    res.locals.user=currentUser;
    
    return next();









    }
    }catch(error){
        return next();
    }
next();
}


exports.protect=catchAsync(async(req,res,next)=>{


// console.log(decoded);
let token;

if(req.headers.authorization&&req.headers.authorization.startswith('Bearer')){
    token=req.headers.authorization.split(' ')[1];
    
}

else if(req.cookies.jwt){
    token=req.cookies.jwt;
}
// console.log(token);
if(!token){
    return next(new AppError('You are not logged in',401));
}
const decoded=await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);

const currentUser=await User.findById(decoded.id);
if(!currentUser)
    {
        return next(new AppError('The user belonging to this token does not exist',401));
    }

    if (currentUser.changedPasswordAfter(decoded.iat)
    ){
return next(new AppError(' User changed password ',401));

    };
      
    req.user = currentUser;
    res.locals.user = currentUser;
  
    next();
})

const filterObj=(obj,...allowedFields)=>{
   
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el))
        {  newObj[el]=obj[el];}

    });
    return newObj;

}


exports.updateMe=catchAsync(async(req,res,next)=>
{
   
   
      if(req.body.password||req.body.passwordConfirm)
        {
            return next(new AppError("Cant Update Password",404));
        }

        const updatedObj=filterObj(req.body,'name','email');
        // console.log(updatedObj);
        // console.log(req.file);
        if(req.file)
         {updatedObj.image=req.file.fileName;
            await  s3Upload(req);
         }
          const updatedUser=await User.findByIdAndUpdate(req.user._id,updatedObj,{
            new:true,
            runValidators:true
        });
       
        // console.log(updatedUser);
   
    res.status(200).json({
        status:'success',
        data:{
            user:updatedUser
        }
    });



})


exports.updatePassword= catchAsync(async (req,res,next) => {

   

    const user=await User.findById(req.user.id).select('+password');
    // console.log(user);

    if(! (await user.confirmPassword(req.body.passwordCurrent,user.password))) {
        // console.log("error");
        return next (new AppError('Enter Invalid Current Password',401));}

  user.password=req.body.password;
  await user.save();
  createAndSendToken(user,200,res);


 
})

exports.forgotPassword = catchAsync(async(req, res, next)=>{
    // console.log(req);
    const email=req.body.email;
    const user=await User.findOne({email});
       if(!user)
        {
            return next(new AppError('There is no user with this email',404));
        }
        try{
            const resetPasswordToken = await user.createResetPasswordToken();
        await user.save({validateBeforeSave:false});
    const url=`${req.protocol}://${req.get('host')}/resetPassword/${resetPasswordToken}`;
     await new Email(user,url).sendPasswordReset();
     res.status(200).json({
        status:"success",
        message:'Reset Link Sent Sucessfully'
    
       });
}catch(err) {
    user.passwordResetToken=undefined,
    user.resetTokenExpires=undefined
    await user.save({validateBeforeSave:false});
}


})


exports.resetPassword=catchAsync(async(req,res,next)=>{
    // console.log(req.params.token);
    const resetToken=req.params.token;
    // console.log(resetToken);
    
    const hashedToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    // console.log(hashedToken);
    const user=await User.findOne({passwordResetToken:hashedToken,resetTokenExpires:{$gt:Date.now()}});
    if(!user)
    {
        return next(new AppError('Invalid Token',400));
    }
    user.password=req.body.password;
    // user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.resetTokenExpires=undefined;
    await user.save();
    createAndSendToken(user,200,res);
    await new Email(user).passwordChanged();
});

exports.addFriend=async(req, res, next)=>{
    const user=await User.findById(req.user.id);
    // console.log(req.body.friendId);
    const friend=await User.findById(req.body.friendId);
    if(!friend)
    {
        return next(new AppError('No User Found',404));
    }
    if(user.friends.includes(friend._id))
    {
        return next(new AppError('Already Friends',400));
    }
    user.friends.push(friend._id);
    // console.log(friend);
    // console.log(user._id);
    friend.friends.push(user._id)
    await user.save();
    await friend.save();
    res.status(200).json({
        status:'success',
        data:{
            user
        }
    });


}
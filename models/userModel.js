const mongoose=require('mongoose')
const bcrypt =require('bcrypt')
const crypto = require('crypto');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Enter a name']
    },
    email:{
        type:String,
        unique:true,
        required:[true,'Enter a valid email address']
    },
    password:{
        type:String,
        required:[true,'Enter a valid password']
    },image:{
        type:String,
        // required:true
    },
    is_active:{
        type:String,
        default:'0'
    },passwordChangedAt: Date,
    passwordResetToken:String,
    resetTokenExpires:Date,
    friends:{ type: [mongoose.Schema.Types.ObjectId], 
    default: [new mongoose.Types.ObjectId('6672c0bf704f05effb4a5b08')] }
},{timestamps:true})


userSchema.pre('save', async function(next){
    if(!this.isModified('password'))return next();
    this.password=await bcrypt.hash(this.password,12);
    next();


});
userSchema.pre('save', function(next){

    if(!this.isModified('password')||this.isNew)return next();
    this.passwordChangedAt=Date.now()-1000;
    next();





});
userSchema.methods.confirmPassword = async function(candidatePassword,userPassword){
   
    return await bcrypt.compare(candidatePassword,userPassword);


}

userSchema.methods.createResetPasswordToken = async function(){
    const resetToken=crypto.randomBytes(32).toString('hex');
    this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetTokenExpires= Date.now()+10*60*1000;
    // console.log(this.resetTokenExpires);
    return resetToken;

}

userSchema.methods.changedPasswordAfter=function(JWTTimestamp)
{
    if(this.passwordChangedAt)
    {
 const changedTimeStamp=parseInt(this.passwordChangedAt.getTime()/1000,10);
       return JWTTimestamp < changedTimeStamp;
    }
    return false;
};

module.exports=mongoose.model('User',userSchema)
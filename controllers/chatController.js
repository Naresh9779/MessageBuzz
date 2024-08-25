
const { response } = require('../app');
const Chat=require('../models/chatModel')
const catchAsync = require('../utils/catchAsync')
const Email=require('../utils/email')
const User=require('../models/userModel')

exports.saveChat=catchAsync(async(req,res)=>{
    // console.log(req.body);
    const {sender_id,reciever_id,message}=req.body;


    const chat=new Chat({
        sender_id,
        reciever_id,
        message
    })
    
    await chat.save();
    const user=await User.findById(reciever_id);
//     if(user.is_active==0)
// {
//   new Email(user).recieveMessage();
// }


    

    res.status(200).json({
        
        status:"success",
    data:chat})
});

exports.deleteChat=catchAsync(async(req,res)=>{


    const chatId=req.body.id;
    // console.log(chatId);
    const chat=await Chat.findByIdAndDelete({_id:chatId});
    if(!chat){
        return res.status(404).json({
            status:"fail",
            message:"No chat found"
        })
    }
    res.status(200).json({
        status:"success",
        data:null
    })
});
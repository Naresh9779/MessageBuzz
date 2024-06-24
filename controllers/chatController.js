
const Chat=require('../models/chatModel')
const catchAsync = require('../utils/catchAsync')

exports.saveChat=async(req,res)=>{
    // console.log(req.body);
    const {sender_id,reciever_id,message}=req.body;

    const chat=new Chat({
        sender_id,
        reciever_id,
        message
    })
    await chat.save();
    

    res.status(200).json({
        
        status:"success",
    data:chat})
}

exports.deleteChat=async(req,res)=>{


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
}
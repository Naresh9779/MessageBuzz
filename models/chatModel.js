const mongoose=require('mongoose');

const chatSchema=new mongoose.Schema({
sender_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
},
reciever_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
},
message:{
    type:String,
    required:[true,'Enter a message']
},
read:{
    type:Boolean,
    default:false
}





},{timestamps:true});

module.exports=mongoose.model('Chat',chatSchema);
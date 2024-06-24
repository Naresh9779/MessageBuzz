
const mongoose = require('mongoose');
const http = require('http');
const app=require('./app');
const dotenv=require('dotenv');
const User=require('./models/userModel');
const Chat=require('./models/chatModel');

dotenv.config({path:'./config.env'});
const server = http.createServer(app);

// console.log( process.env.DATABASE_PASSWORD)

const DB=process.env.DATABASE.replace(
    '<password>',
    process.env.DATABASE_PASSWORD
)
// console.log(DB)
mongoose.connect(DB,{
   
    autoIndex: true, 
}).then(()=>{
    console.log("Db connection is established");


 });
 const { Server } = require('socket.io');
const { receiveMessageOnPort } = require('worker_threads');
 const io = new Server(server);
 const nameSpace = io.of('/username-space');

 nameSpace.on('connection', async(socket) => {
    // console.log(socket.handshake.auth.token)
      const userId=socket.handshake.auth.token;
      await User.findByIdAndUpdate({_id: userId},{$set:{is_active:'1'}})
      socket.broadcast.emit('getOnlineUser',{
        userId
      })
      // console.log(`User ${userId}`)
    

    socket.on('disconnect', async() => {
        // console.log('User disconnected from username-space');
        // console.log(`User ${userId}`)
         await User.findByIdAndUpdate({_id: userId},{$set:{is_active:'0'}})
         socket.broadcast.emit('getOfflineUser',{
            userId
          })
    });


    socket.on('readChat', async(data) => {
      
      await Chat.updateMany({$or:[{sender_id:data.sender_id,reciever_id:data.reciever_id},{reciever_id:data.sender_id,sender_id:data.reciever_id}]},{$set:{read:true}});

    })

    socket.on('newChat', function(data){
    
      socket.broadcast.emit('loadNewChat',data)
    });
    socket.on('chatDeleted', function(data){
      socket.broadcast.emit('chatDeleted',data)

    })


    socket.on('loadOldChat',async (data)=>{
      // console.log(data);

        var chat= await Chat.find({$or:[{sender_id:data.sender_id,reciever_id:data.reciever_id},{reciever_id:data.sender_id,sender_id:data.reciever_id}]
      

         })
         await Chat.updateMany({reciever_id:data.sender_id},{$set:{read:true}});
       
         var sender= await User.findById(data.sender_id);
         var reciever=await User.findById(data.reciever_id);
      socket.emit('existingChat',{
        chat,reciever,sender
      })
      // console.log(chat);
    })
 
});




 const port=process.env.PORT||3000;
 server.listen(port,()=>{
 
 console.log(`listening on port ${port}`);
 
 });

 
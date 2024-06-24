const { inflateRawSync } = require("zlib")
const User = require("../models/userModel")
const Chat = require("../models/chatModel")


exports.homePage=(req,res,next)=>{
    res.status(200).render('homePage',{
        title:'Home Page'
    })
}
exports.isAuthenticated=(req,res,next)=>{
    // console.log(req.user);
    if(req.user)
        {
            return res.status(200).render('homePage',{
                 title:'Home Page'
            })        }
    return next();

}
exports.signup=(req,res)=>{

res.status(200).render('signup',{
    title:'Signup',

})


}

exports.login=(req,res)=>{
    res.status(200).render('login',{
        title:'Login'
    })
}

exports.dashboard=async(req,res)=>{
    const user= await User.findById([req.user.id]);
   let users =await User.find({ _id: { $in: user.friends } });
    const chats = await Chat.find({ reciever_id: req.user.id, read: false });
    
    const updatedUsers = users.map(user => {
      // Check if there's an unread chat from this user
      const hasUnreadChat = chats.some(chat => chat.sender_id.toString() === user._id.toString());
    
      // Add the 'read' property
      if (hasUnreadChat) {
        return {
          ...user.toObject(), // Convert Mongoose document to plain JS object
          read: false
        };
      }
    
      return user;
    });
    
    users=updatedUsers;
    // console.log(updatedUsers);
    
   
    
    // console.log(users);
    res.status(200).render('dashboard',{

       users,
        title:'Dashboard'


    })
}

exports.setting=(req,res) => {
    res.status(200).render('setting',{
        title:'Setting'
    })
}

exports.forgotPassword=(req,res) => {
    res.status(200).render('forgotPassword',{
        title:'Forgot Password'
    })
}
exports.logout=(req,res)=>{
   res.redirect('/login')
}

exports.resetPassword=(req,res)=>{
    res.status(200).render('resetPassword',{
        title:'Reset Password'
    })
}

exports.friends=async (req,res)=>{
    const user=await User.findById([req.user.id]);
  
   
    const friends = await User.find({ 
        _id: { 
          $nin: user.friends.concat(user._id) 
        } 
      });
    // console.log(friends);

    res.status(200).render('friends',{
        friends,
        title:'Friends'
    });
}




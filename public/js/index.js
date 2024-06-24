import {signHelper} from "./signup";
import { loginHelper } from './login';
import { logout } from "./login";
import {forgetPassword,resetPassword} from "./auth";
import { addFriend } from "./addFriend";


import { initChat } from './chat.js';
import {initSettings } from './settings.js';

document.addEventListener('DOMContentLoaded', () => {
    // Check if the chat container exists before initializing chat
    if (document.querySelector('#chat-container')) {
        initChat();
    }


    // Check if the settings container exists before initializing settings
    if(document.querySelector('.user-view__content')){
        initSettings();

    }
});



// const loginHelper=require('./login')
const signup=document.querySelector('.form--signup');
const login=document.querySelector('.form--login');
const signOut=document.getElementById('sign-out');
const forgotPassword=document.querySelector('#forgotPasswordForm');
const resetPasswords=document.querySelector('#resetPasswordForm');
const friends=document.querySelector('.friend-container');






if(signup){document.getElementById('signupbtn').addEventListener('click',async e=>
{
    e.preventDefault();
    const form=new FormData();
    form.append('name',document.getElementById('name').value)
    form.append('email',document.getElementById('email').value)
    form.append('password',document.getElementById('password').value)
    form.append('image',document.getElementById('photo').files[0])


   
    
    
    signHelper(form);

})}

if(login){document.getElementById('loginbtn').addEventListener('click',async e=>
{
    e.preventDefault();
   
    const email= document.getElementById('email').value;
    const password=document.getElementById('password').value;


    
    loginHelper(email,password);

})}

if(signOut){
    signOut.addEventListener('click',async e=>
    {
        e.preventDefault();
        logout();
        
    })
}

if(forgotPassword){
    

    document.getElementById('forgot-btn').addEventListener('click',async function(e){
        e.preventDefault();
       


        
        const email=document.getElementById('email').value;
       
       
        forgetPassword(email);
        
    })
}

// reset_password.js

if(resetPasswords){
    const resetButton = document.getElementById('reset-btn');

  
    resetButton.addEventListener('click', async function(e) {
      e.preventDefault();
    //   console.log('reset');
  
      const fullPath = window.location.pathname;
      const token = fullPath.split('/').pop();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
  
      
      await resetPassword(token, password, confirmPassword);
        
     
    });
  
    
};
if(friends)
    {
        
        const friendsList=document.querySelectorAll('.user-item');
        // console.log(friendsList);
        friendsList.forEach(friend=>{
            friend.querySelector('.add').addEventListener('click',async e=>{
                e.preventDefault();
                
                const friendId=friend.getAttribute('data-id');
                 await addFriend(friendId);
                 friend.querySelector('.add').style.display='none';
                 friend.querySelector('.added').style.display='block';
            })
        });
    }
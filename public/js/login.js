import axios from "axios";
import { showAlert,hideAlert } from "./alert.js";
// import { response } from "express";
// import { RemoteSocket } from "socket.io";
export const loginHelper=async(email,password)=>{

try{   const res=await axios({
    method:'post',
    url:'/api/v1/user/login',
    data:{
        
        email,password
    }

   })

   if(res.data.status ==="success"){
    // alert('success',"Loged In Successfully");
    showAlert("success","Logged In Successfully");
    window.setTimeout(()=>{
       
        location.assign('/dashboard')
    },1000)
   }
  

}

catch(err){
    
    showAlert("error",`${err.response.data.message}`);
    // console.log(err.response);
    // window.setTimeout(()=>{
       
    //     hideAlert();
    //     },5000)
    
}
}


export const logout=async()=>{
    try{
        const res=await axios({
            method:'get',
            url:'/api/v1/user/logout'
        })
        if(res.data.status==="success"){
            showAlert('success',"Logged Out Successfully");
            window.setTimeout(()=>{
                location.assign('/')
            },1000)
        }
    }catch(err){
        // console.log(err.data.data)
        showAlert("error",`${err.data.message}`);
     
        
        
    }

}

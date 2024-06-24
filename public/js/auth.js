
import axios from "axios";
import { showAlert } from "./alert";
export const  forgetPassword=async(email)=>{
  
    try{
        const res=await axios({
            method:'put',
            url:'/api/v1/user/forgot-password',
            data:{
                email
            }
        })
        // console.log(res.data);
        if(res.data.status==="success"){
            setTimeout(function() {
                showAlert('success','Email 📧 Sent sucessfully')
                
              }, 1000); // Simulate a delay for email sending process
           
        }
    }catch(err){
        setTimeout(function() {
           showAlert('error','Error: Email  Not Found')
          }, 1000); // Simulate a delay for email sending process
     
        
        
    }
}

export const resetPassword=async(token,password,passwordConfirm) => {
    if(passwordConfirm!=password)
        {
            showAlert('error', 'Error:  Passwords do not match')
        
        }
   else{     
    try{

        const res=await axios({
            method:'patch',
            url:`/api/v1/user/reset-password/${token}`,
            data:{
                password
            }
        })

        if(res.data.status === 'success'){
            showAlert('success', 'Password reset Sucessfully')
            setTimeout(function() {
                window.location.assign('/login')
              }, 1000); 
        }
    
    }
    catch(error){
        console.log(error)
        showAlert('error', 'Error:  Please Try Again  ')
       
}
}
}

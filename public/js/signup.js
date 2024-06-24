import axios from 'axios';
import { showAlert,hideAlert } from "./alert.js";
export const signHelper= async(data)=>{
  // console.log(data);
  


    
    try{
     
        const res=await axios(
          { 
            url:'api/v1/user/signup',
            method:'POST',
          data
        }
          );
          if(res.data.status==="success")
          {
            showAlert("success","Registerd Successfully");
            window.setTimeout(()=>{
              location.assign('/dashboard')
          },1000)

          }
    }
    catch(err)
    {
      console.log(err)
      showAlert("error",`${err.response.data.message}`);
      window.setTimeout(()=>{
  
      hideAlert();},3000);
      
    }
}
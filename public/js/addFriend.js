import axios from "axios";
import { hideAlert, showAlert } from "./alert";
export const addFriend=async(dataId)=>{
   try{ const res=await axios({
    
            method:"patch",
            url:"/api/v1/user/addFriend",
            data:{
                friendId:dataId
            }
        },
       
        

    )
   if(res.data.status === "success"){
    showAlert("success","Friend Added Sucessfully")

    setTimeout(function() {
        hideAlert();
      }, 1000); 

    }
   
}catch(err){
    showAlert("error",err.response.data.message)
    setTimeout(function() {
        hideAlert();
      }, 1000); 


    }
}
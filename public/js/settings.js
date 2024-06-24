
import axios from "axios";
import { hideAlert, showAlert } from "./alert";
export const initSettings = () => {
    
const form=document.querySelector('.form-user-data');

form.addEventListener('submit',async(e)=>{
    e.preventDefault();
   const form=new FormData();
   form.append('name',document.getElementById('name').value)
   form.append('email',document.getElementById('email').value)
   form.append('image',document.getElementById('photo').files[0])

   update(form);
   
    
});

const  passwordForm=document.querySelector('.form-user-settings');
 passwordForm.addEventListener('submit',async(e)=>{
  e.preventDefault();
  const passwordCurrent=document.getElementById('password-current').value;
  const password=document.getElementById('password-new').value;
  const passwordConfirm=document.getElementById('password-confirm').value;
    if(password!=passwordConfirm)
      {
        showAlert("error"," Check Password Confirm !!");

        window.setTimeout(()=>
          {
            hideAlert();
          },3000
        )
        
      }
      else{
        
        updatePassword(passwordCurrent,password);
      }







 });





const updatePassword=async(passwordCurrent,password)=>{
  try{
    const res=await axios({
      method:'patch',
      url:'/api/v1/user/updatePassword',
      data:{
        passwordCurrent,
        password
       
      }

      
    })
    // console.log(res);
    if(res.data.status=='success')
      {
        showAlert("success","Password Updated Sucessfully");
        window.setTimeout(() =>{
          window.location.reload()
        },2000);
      }
  
  }catch(err){
      showAlert("error",`Error: Entered Current Password Not Matched !!`);
      window.setTimeout(() =>{
       hideAlert();
      },3000);
    }


    


}
  

 const update=async (data)=>{
    // console.log(data);
    // console.log(data.get('image'));

   try{
     const res=await axios({
     method:'patch',
     url:'/api/v1/user/updateMe',
     data,
    

    })
    if(res.status="success")
        {
            showAlert("success","Updated successfully");

          window.setTimeout(() =>{
            window.location.reload()
          },2000);
        }

}
    catch(err){
        showAlert("error",err);
        window.setTimeout(() =>{
            window.location.reload()
          },3000);
        
        
    }


 }














};
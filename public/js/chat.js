import axios from "axios";
// import io  from "socket.io";
import io from 'socket.io-client'

export function initChat(){const userId = document.querySelector('#chat-container').getAttribute('data-id')
const socket = io('/username-space', {
  auth: {
    token: userId
  }
});


  let reciever_id;
  let sender_id;








  document.getElementById('message').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent the default form submission
      document.getElementById('message-btn').click(); // Trigger the send button click
    }
  });
  document.getElementById('message-btn').addEventListener('click', async e => {

    e.preventDefault();

    // console.log('clicked...')
    const messageInput = document.getElementById('message').value;
    // console.log(message);

    // console.log(sender_id);
    // console.log(reciever_id);
    const message=messageInput.trim();

   if(message.length!=0) {const form = new FormData();
    // console.log(document.getElementById('message').value);
    form.append('message', document.getElementById('message').value)
    form.append('sender_id', sender_id);
    form.append('reciever_id', reciever_id);

    saveChat(form);

    document.getElementById('message').value = '';}



  });
  $(document).ready(function () {
    $('.user-item').click(function () {
      // console.log(document.querySelector('.user-item').getAttribute('data-id'));
      // document.querySelector('#chat-container').setAttribute('data-rid')=document.querySelector('.user-item').getAttribute('data-id');




      $('.start-head').hide();
      $('.chat-section').show();
      const item=document.querySelector('.new-message');
      if(item)
        {
          item.remove();
        }
      sender_id = userId;

      reciever_id = $(this).attr('data-id');
      //  console.log("senderId",sender_id);
      //  console.log("recieverId",reciever_id);



      $('#chat-container').html(' ');


     socket.emit('loadOldChat', {

        sender_id,
        reciever_id
      })




    })
  })

  
  socket.on('connect', () => {
    // console.log('Connected to username-space');
  });
  socket.on('disconnect', () => {
    // console.log('Disconnected from username-space');
  });
  socket.on('getOnlineUser', function (data) {
    //- console.log(data);
    $('#' + data.userId + '-status').text('● online')
    $('#' + data.userId + '-status').removeClass('logged-of')
    $('#' + data.userId + '-status').addClass('logged-in')


  });

  socket.on('getOfflineUser', function (data) {
    //- console.log(data);
    $('#' + data.userId + '-status').text('● offline')
    $('#' + data.userId + '-status').removeClass('logged-in')
    $('#' + data.userId + '-status').addClass('logged-of')


  });
  socket.on('loadNewChat', function (data) {
    //  console.log("Sender",data.data.sender_id);
    //  console.log("Reciever",data.data.reciever_id);
    //  console.log("Sender_id",userId);
    //  console.log("Reciever_id",reciever_id);
    
    
    
    if(userId==data.data.reciever_id&&reciever_id!=data.data.sender_id) {
    let html1 = `<div class="new-message">*New Message</div>`;
    

    const div= document.querySelector(`.user-item[data-id="${data.data.sender_id}"]`);
    if(div.classList!="new-message") {
    div.insertAdjacentHTML('beforeend',html1);
    }
    }
    else if (sender_id === data.data.reciever_id && reciever_id === data.data.sender_id) {
      let html = `<div class="r-user" data-id="${data.data._id}">
              ${data.data.message}
            </div>`;
          
  
      socket.emit('readChat',{
              sender_id,
              reciever_id
       })
      document.getElementById('chat-container').insertAdjacentHTML('beforeend', html);
      const chatContainer = document.getElementById('chat-container');
      
      chatContainer.scrollTop = chatContainer.scrollHeight;
     

    }



  });



  //  chatContainer = document.getElementById('chat-container');
  // console.log('chat-container',chatContainer)

  socket.on('existingChat', async function (data) {

    // console.log('sucessfully loaded');
    const chats = data.chat
    // console.log(data.reciever);
    if (data.reciever)
    // console.log(data.reciever.image)
    {
      let newHtml = `<nav class="nav-bar-chat">
                               <img src="https://messagebuzz.s3.amazonaws.com/img/users/${data.reciever.image}", id="avatar", alt="dp">
                               <h4>${data.reciever.name}</h4>
                            <nav>`;
                         
 await document.querySelector("#chat-container").insertAdjacentHTML('beforeend', newHtml);
    
    for (let i = 0; i < chats.length; i++) {
    
       const c = chats[i].sender_id == userId ? 'sender-user' : 'r-user';

    
      let html = `<div class="${c}" data-id=${chats[i]._id}>
              ${chats[i].message}
            </div>`;
         
           
     document.querySelector("#chat-container").insertAdjacentHTML('beforeend', html);
      const chatContainer = document.getElementById('chat-container');
              
      chatContainer.scrollTop = chatContainer.scrollHeight;
            }
            addDelete();
            
    }



   



  });



  const addDelete=()=>{

    const senderChat = document.querySelectorAll('.sender-user');
    // console.log(senderChat);
    
    senderChat.forEach(function (div) {
    
      div.addEventListener('click', function () {
    
       
       
    
    

    let deleteBtn = div.querySelector('.delete-btn');
    if (!deleteBtn) {
      const dltBtnHTML = `<div class="delete-btn" style="display: block;">
                            <ion-icon name="trash-outline"></ion-icon>
                          </div>`;
      div.insertAdjacentHTML('beforeend', dltBtnHTML);
      deleteBtn = div.querySelector('.delete-btn');
    } else {
      // Toggle visibility if it already exists
      deleteBtn.style.display = deleteBtn.style.display === 'none' ? 'block' : 'none';
    }

    // Remove any existing event listener before adding a new one
    deleteBtn.replaceWith(deleteBtn.cloneNode(true));
    deleteBtn = div.querySelector('.delete-btn');

    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation(); // Prevent the click event from bubbling up to the message element

      const chatId = div.getAttribute('data-id');
      // console.log(chatId)
      deleteChat(chatId,div);

     
    });
  });
});


  }

   
   const deleteChat=async(chatId,div)=>
  {
    try {
      const res = await axios({
        method: "DELETE",
        url: "/api/v1/chat/delete-chat",
        data: {
          id: chatId
        }
      });
      // console.log(res.data);
      if (res.data.status === 'success') {
        div.remove();
        socket.emit('chatDeleted', chatId);
      
      }
    } catch (err) {
      console.log(err);
    }
  }




socket.on('chatDeleted', function (data)
{
  // console.log(data);
  // const divF=document.querySelectorAll('.r-user');
  const div=document.querySelector(`div[data-id="${data}"]`)
 if(div){ div.remove();}
})


 const saveChat = async (data) => {
    // console.log(data.get('message'));
    try {
      const res = await axios({
        method: "POST",
        url: "/api/v1/chat/save-chat",
        data: {
          message: data.get('message'),
          sender_id: data.get('sender_id'),
          reciever_id: data.get('reciever_id'),

        }

      })
      // console.log(res.data);

      if (res.data.status == "success") {
        let mesg = res.data.data.message;
        let html = `<div class="sender-user" data-id="${res.data.data._id}">
          ${mesg}
        </div>`;
        document.getElementById("chat-container").insertAdjacentHTML('beforeend', html);
        
        
        socket.emit('newChat', res.data);
        
       
        
      
         
        const chatContainer = document.getElementById("chat-container");
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        addDelete();


        
        



      }



    } catch (err) {
      console.log(err);


    };


  }
}

const nodemailer=require('nodemailer')
const pug=require('pug')
const path=require('path')
const dotenv=require('dotenv');
dotenv.config({path:'./config.env'});


const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// Configure OAuth2 client
const CLIENT_ID=process.env.CLIENT_ID
const CLIENT_SECRET=process.env.CLIENT_SECRET
const REDIRECT_URL=process.env.REDIRECT_URL
const REFRESH_TOKEN=process.env.REFRESH_TOKEN
const EMAIL_FROM=process.env.EMAIL_FROM

// console.log(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
// console.log(REFRESH_TOKEN)
const oauth2Client = new OAuth2(
 CLIENT_ID,
  CLIENT_SECRET,
 REDIRECT_URL // This can be any URL, but must match the one configured in Google Developer Console
);

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN // Replace with the refresh token obtained from OAuth2 flow
});


module.exports=class email{
    constructor(user,url)
    {   this.to=user.email;
        this.firstName=user.name.split(' ')[0];
        this.from=`<${process.env.EMAIL_FROM}>`
        this.url=url;
    }






   newTransport(){ return nodemailer.createTransport({

    
    service: 'gmail',
  auth: {
    type: 'OAuth2',
    user:EMAIL_FROM,
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    refreshToken:REFRESH_TOKEN,
    accessToken: oauth2Client.getAccessToken()
  }
  });
}

    async send(template,subject)
 {
    const html= await pug.renderFile(path.join(__dirname,`../views/email/${template}.pug`),{
    firstName:this.firstName,
    url:this.url,
    year:new Date().getFullYear(),
    subject
    });
   const mailOptions = {
    from: this.from,
    to: this.to,
    subject,
    html: html
   }
   await this.newTransport().sendMail(mailOptions);
   console.log('email sent');

  }


  async sendWelcome(){
    await this.send('welcome','Welcome to the app');
  }

  async sendPasswordReset(){
    await this.send('passwordReset','Your password reset token (valid for 10 minutes)');
  }

  async passwordChanged(){
    await this.send('passwordChanged','Your Password Changed Successfully');
  }
 
  async loginSucessfully(){
    await this.send('loginSucessfully','Login Sucessfully');
  }
}
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const pug = require('pug');
const path = require('path');
const dotenv = require('dotenv');
const AppError = require('../utils/appError');

dotenv.config({ path: './config.env' });

const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URL = process.env.REDIRECT_URL;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_FROM = process.env.EMAIL_FROM;

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function refreshAccessToken() {
  try {
    console.log('Attempting to refresh access token...');
    const response = await oauth2Client.refreshAccessToken();
    const tokens = response.credentials;
    oauth2Client.setCredentials(tokens);
    // console.log('Access token refreshed:', tokens.access_token);
    return tokens.access_token;
  } catch (error) {
    console.error('Error refreshing access token:', error.response ? error.response.data : error);
    return next(  new AppError('Error refreshing access token', 500));
  }
}

async function newTransport() {
  try {
    const accessToken = await refreshAccessToken();
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: EMAIL_FROM,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
  } catch (error) {
    console.error('Error creating transport:', error.response ? error.response.data : error);
    return next( new AppError('Error creating transport', 500));
  }
}

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = `${EMAIL_FROM}`;
    this.url = url;
  }

  async send(template, subject,next) {
    try {
      const html = pug.renderFile(path.join(__dirname, `../views/email/${template}.pug`), {
        firstName: this.firstName,
        url: this.url,
        year: new Date().getFullYear(),
        subject,
      });

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
      };

      const transport = await newTransport();
      await transport.sendMail(mailOptions);
      console.log('Email sent to:', this.to);
    } catch (error) {
      console.error('Error sending email to:', this.to, error.response ? error.response.data : error);
      return next( new AppError('Error sending email', 500));
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the app');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Your password reset token (valid for 10 minutes)');
  }

  async passwordChanged() {
    await this.send('passwordChanged', 'Your Password Changed Successfully');
  }

  async loginSucessfully() {
    await this.send('loginSucessfully', 'Login Successfully');
  }

  async recieveMessage() {
    await this.send('recieveMessage', 'Check Out! New Message Received');
  }

  async addedFriend() {
    await this.send('addedFriend', 'You have a new Friend Request');
  }
};

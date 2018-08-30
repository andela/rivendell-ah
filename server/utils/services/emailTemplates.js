export default {
  verificationTemplate: url => (`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>AH | Password Reset</title>
    <style>
      .body-container {
        background: rgba(0, 0, 0, .1);
        padding: 30px 0;
      }
      .container {
        max-width: 960px;
        width: 80%;
        margin: 30px auto;
        text-align: center;
      }
      .header {
        margin: 20px 0;
        font-size: 120%;
      }
      .body {
        background: white;
        padding: 30px;
        box-sizing: border-box;
      }
      #link {
        text-decoration: none;
        background-color: #3498db;
        padding: 15px 40px;
        font-size: 120%;
        border-radius: 5px;
        color: #fff;
        border: 2px solid #3498db;
        margin-bottom: 30px;
        display: inline-block;
      }
      #link:hover {
        background-color: #fff;
        border-color: #3498db;
        color: #3498db;
      }
      .footer {
        margin: 30px;
      }
    </style>
  </head>
  <body>
    <div class="body-container">
      <div class="container">
        <div class="header">Author Haven</div>
        <div class="body">
        <h1>Email Verification</h1>
        <p>Hello, you are one step away from 
        unlocking the full potentials of Authors Haven. <br />
          Simply click the big blue button below to verify your email.</p>
        <a href="${url}" id="link">Verify Email</a>
        </div>
        <div class="footer">Author Haven Copyright 2018</div>
      </div>
    </div>
  </body>
  </html>`),
  resetPasswordTemplate: (url, user) => (`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>AH | Password Reset</title>
    <style>
      .body-container {
        background: rgba(0, 0, 0, .1);
        padding: 30px 0;
      }
      .container {
        max-width: 960px;
        width: 80%;
        margin: 30px auto;
        text-align: center;
      }
      .header {
        margin: 20px 0;
        font-size: 120%;
      }
      .body {
        background: white;
        padding: 30px;
        box-sizing: border-box;
      }
      #link {
        text-decoration: none;
        background-color: #3498db;
        padding: 15px 40px;
        font-size: 120%;
        border-radius: 5px;
        color: #fff;
        border: 2px solid #3498db;
        margin-bottom: 30px;
        display: inline-block;
      }
      #link:hover {
        background-color: #fff;
        border-color: #3498db;
        color: #3498db;
      }
      .footer {
        margin: 30px;
      }
    </style>
  </head>
  <body>
    <div class="body-container">
      <div class="container">
        <div class="header">Author Haven</div>
        <div class="body">
          <h1>Password Reset</h1>
          <p>Hi ${user.username}, Seems like you forgot your password for 
          Author's Haven account. If this is true, click below
            to reset your password.<br/><strong>NB: 
            </strong>This Verification Token is only valid for 30 minutes.</p>
          <a href="${url}" id="link">Reset My Password</a>
          <p>If you did not forget your password for Author's Haven you 
          can safely ignore this email</p>
        </div>
        <div class="footer">Author Haven Copyright 2018</div>
      </div>
    </div>
  </body>
  </html>`
  ),
  notificationTemplate: notification => (`<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>AH | Notification</title>
    <style>
      .body-container {
        background: rgba(0, 0, 0, .1);
        padding: 30px 0;
      }
      .container {
        max-width: 640px;
        width: 80%;
        margin: 30px auto;
        text-align: center;
      }
      .header {
        margin: 20px 0;
        font-size: 120%;
      }
      .body {
        background: white;
        padding: 30px;
        box-sizing: border-box;
        text-align: left;
      }
      .title {
        text-align: center;
      }
      .link-div {
        text-align: center;
      }
      #link {
        text-decoration: none;
        background-color: #3498db;
        padding: 10px 25px;
        font-size: 120%;
        border-radius: 5px;
        color: #fff;
        border: 2px solid #3498db;
        margin-bottom: 30px;
        display: inline-block;
        text-align: center;
      }
      #link:hover {
        background-color: #fff;
        border-color: #3498db;
        color: #3498db;
      }
      .unsubscribe {
        font-size: 0.9em;
        font-style: italic;
        text-align: center;
      }
      .footer {
        margin: 30px;
      }
    </style>
  </head>
  <body>
    <div class="body-container">
      <div class="container">
        <div class="header">Author Haven</div>
        <div class="body">
        <h1 class='title'>Notification</h1>
        <h3> Hi ${notification.name}, </h3>
        <p>You have a new notification from the Authors Haven 
        <a href="${notification.ah}">(authorshaven.com)</a>.</p>
        <hr>
        <p>${notification.message}.</p>
        <div class="link-div"><a href="${notification.url}" id="link"> 
        View notification</a></div>
        <div>
          <p class="unsubscribe">Don't want to receive this 
          kind of notification again? 
          Click <a href="${notification.unsubscribe}">
          unsubscribe</a> to opt-out.</p>
        </div>
        </div>
        <div class="footer">Author Haven Copyright &copy 2018</div>
      </div>
    </div>
  </body>
  </html>`),
};

module.exports = {
  verificationTemplate: url => (`<!DOCTYPE html>
    <html>
    <head>
      <style type="text/css">
        * {
          margin: 0;
          padding: 0;
          border: 0;
        }
        body {
          background-color: rgba(255, 255, 255, 0.911);
        }
        #container {
          text-align: center;
          max-width: 760px;
          margin: 0 auto;
          min-height: 400px;
        }
        h1 {
          margin: 30px 0 30px 0;
        }
        p {
          margin-bottom: 40px;
          line-height: 1.4;
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
        }
        #link:hover {
          background-color: #fff;
          border-color: #3498db;
          color: #3498db;
        }
      </style>
    </head>
    <body>
      <div id="container">
        <h1>Email Verification</h1>
        <p>Hello, you are one step away from 
        unlocking the full potentials of Authors Haven. <br />
          Simply click the big blue button below to verify your email.</p>
        <a href="${url}" id="link">Verify Email</a>
      </div>
    </body>
    </html>`),
};

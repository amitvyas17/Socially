const nodemailer = require('nodemailer')
require('dotenv').config();

function sendResetLink(userEmailId,link){
let mailTransporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'reset.socially@gmail.com',
        pass:process.env.EMAIL_PASSWORD
    }

})
let details = {
    from:"reset.socially@gmai.com",
    to:userEmailId,
    subject:"Reset Password!!!",
    html:`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
    
            .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            h1 {
                color: #333;
            }
    
            p {
                color: #555;
            }
    
            a {
                color: #007BFF;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Password Reset Request</h1>
            <p>Dear User,</p>
            <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
            <p>To reset your password, click on the following link:</p>
            <p><a href=${link}>Reset Password</a></p>
            <p>If the above link does not work, copy and paste the following URL into your browser:</p>
            <p>${link}</p>
            <p>Thank you,<br>Reset Socially Team</p>
        </div>
    </body>
    </html>
    `
}
mailTransporter.sendMail(details,(err)=>{

    if(err){
        console.log('Err',err)
    }
    else{
        console.log('The mail has been sent')
    }
})
}
module.exports = sendResetLink
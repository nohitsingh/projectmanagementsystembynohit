const nodemailer = require('nodemailer');

const sendEmail = async options =>{
    //1) create transporter
    var transport = nodemailer.createTransport({
        service: process.env.SERVICE,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user:process.env.EMAIL_USERNAME ,
            pass:process.env.EMAIL_PASSWORD
        }
      });


    //2)define email options
         var mailOptions={
            from:process.env.EMAIL_USERNAME ,
            to:options.email,
            subject:options.subject,
            text:options.message,
            html:options.html
        }  

    await transport.sendMail(mailOptions)
}

module.exports = sendEmail
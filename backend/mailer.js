const nodemailer = require('nodemailer');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function sendMail(email, otp) {
  var url = 'https://mymailerotp.herokuapp.com/mail/'+email+'/'+otp;
  console.log(url);
  var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, true ); // false for synchronous request
    xmlHttp.send( null );
}

function forgetMail(email, otp) {
  var url = 'https://mymailerotp.herokuapp.com/forget/'+email+'/'+otp;
  console.log(url);
  var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, true ); // false for synchronous request
    xmlHttp.send( null );
}

// const AWS = require('aws-sdk');

// const SES = new AWS.SES({
//   accessKeyId: "AKIAJV7FO62GJNK7V6SQ",
//   secretAccessKey: "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",
//   region: "us-east-1",
//   endpoint: new AWS.Endpoint('https://email.us-east-1.amazonaws.com')
// });


// function sendMail(email,otp) {
// 	// body...
// 	const params = {
//     Destination: {
//       ToAddresses: [email]
//     },
//     Message: {
// 		Body: {
//     		Html: {
//     			Data: `Dear User,<br><br> 
// Your OTP for Sign-up is  `+otp+`<br><br>
// Please note that this OTP is valid for next 30 mins and will expire after this period.<br><br>
// Thank you. We hope you enjoy your interaction with the bot. Please share your feedback with us at consultinginterviewbot@gmail.com<br><br>
// Customer Service<br><br>
// Consulting Interview Bot<br><br><br>
// ** This is an auto-generated email. Please do not reply to this email.**
// `
//     			},
//     	},
//     	Subject:{
//     		Data: "OTP for Vcoach academy",
//     	}
// 	},Source : "Vcoach Registration \<vcoachacademy01@gmail.com\>", 
// 	};
	
// 	SES.sendEmail(params, function (err, data) {
//     if (err) {
//     	console.log("failed")
//     	console.log(err)
//       // setTimeout(function() {
//       //   // sendMail(email);
//       // }, 300);
//     }
//     else{
//       console.log('%s Mailer sent to %s', (new Date()).toLocaleString("en", {timeZone: "Asia/Kolkata"}),email);
//   	}
//   });
// }



module.exports = {
  sendMail: sendMail,
  forgetMail: forgetMail,
};
var User = require("./models.js");
var PaidUser = require("./third.js");
var Chat = require("./chatModel.js");
var mailer = require("./mailer.js");
const crypto = require("crypto");
const csv = require("csv");
const createPDF = require("./pdfchat");
const Razorpay = require("razorpay")
module.exports = {
    home: home,
    login: login,
    chatbot: chatbot,
    loginpost: loginpost,
    logout: logout,
    signuppost: signuppost,
    convolist: convolist,
    allchat: allchat,
    allusers: allusers,
    pdfChat: pdfChat,
    pdfChat1: pdfChat1,
    forget: forget,
    forgetPost: forgetPost,
    createOrder:createOrder,
    successfulOrder:successfulOrder,
    feedback : feedback,
};
function pdfChat1(req, res) {
    var uri = req.body;
    console.log(uri);
    //const user = JSON.parse(uri);

    createPDF(uri, res);
}


var feedbackAddress = "login/feedback.ejs";
function feedback(req, res){
    console.log('welcome to feedback')
    var userInfo = req.session.user;
    Chat.findAll({ where: { uid: userInfo.id } })
        .then(function (chats) {
             //console.log(chats);
            if (chats.length>0){
            var data = [];
            console.log('yes chats');
            for (const chat of chats) {

                var ds = JSON.parse(chat.chat);
                var rs = JSON.parse(chat.result);
                data.push({
                    time : chat.createdAt,
                    prob : chat.problem,
                    chat : ds,
                    result : rs,
                })
            }
            res.render(feedbackAddress, {
            data: data,
            message: null
        });
        }
            else{
                console.log('no chats');
                res.render(feedbackAddress, {
                message: 'You have not attempted any case yet.',
                data : null
            });
            }})
        .catch(function (err) {
            console.log("Oops! something went wrong, : ", err);
        });

}
var orders={};
var paymentAddress = "login/payment.ejs";
function createOrder(req,res){
    console.log(req.session.user);
    var userInfo = req.session.user;
    var instance = new Razorpay({ key_id: 'rzp_live_AFK6uU1jEYQCNY', key_secret: 'M8ePCX1Qt56WNV6tD5QArZbG' });
    
    
    var options = {
      amount: 3500, 
      currency: "INR",
      receipt: "order_rcptid_" + userInfo.email
    };
    instance.orders.create(options, function(err, order) {
        orders[order.id]=userInfo;
        console.log(orders);
      res.render(paymentAddress, {
            user: userInfo,
            order:order,
        });
    });
}
function successfulOrder(req,res){
    console.log(orders)
    
    var succ=req.body;
    var userInfo=orders[succ.razorpay_order_id];
    console.log(succ);
    console.log(userInfo);
    PaidUser.create({
        name: userInfo.name + ' '+userInfo.lastname,
        email: userInfo.email,
        uid  : userInfo.id,
        orderId : succ.razorpay_order_id,
        paymentId: succ.razorpay_payment_id,
        signature: succ.razorpay_signature
    })
        .then((user) => {
            // checkEmail(req.session.user.email);
            delete orders[succ.razorpay_order_id];
            res.redirect("/bot");
        })
        .catch((error) => {
            delete orders[succ.razorpay_order_id];
            console.log(error);
            res.redirect("/bot");
        });

}

function pdfChat(req, res) {
    var uri = decodeURIComponent(req.params.id);
    console.log(uri);
    const user = JSON.parse(uri.toString());

    createPDF(uri, res);
}
function home(req, res) {
    res.render("index.ejs", {});
}
function allchat(req, res) {
    Chat.findAll({})
        .then(function (chats) {
            // console.log(chats);
            var data = [];
            for (const chat of chats) {
                data.push([
                    chat.uid,
                    chat.name,
                    chat.createdAt,
                    chat.problem,
                    "question",
                    "answer",
                    "time",
                ]);
                var ds = JSON.parse(chat.chat);
                console.log(ds);
                for (const c of ds.chat) {
                    data.push(["", "","","", c[4], c[5], c[6]]);
                }
                var rs = JSON.parse(chat.result);
                for (const y in rs.result) {
                    data.push(["", "","", y, rs.result[y], "", ""]);
                }
                data.push([], [], []);
            }
            csv.stringify(data, (err, output) => {
                res.writeHead(200, {
                    "Content-Type": "text/csv",
                    "Content-Disposition": "attachment; filename=Data.csv",
                });
                res.end(output, "binary");
            });
        })
        .catch(function (err) {
            console.log("Oops! something went wrong, : ", err);
        });
}

function allusers(req, res) {
    data=[]
    User.findAll({})
        .then(function (users) {
            // console.log(chats);
            data.push;
            var output = "name,lastname,email,institution,phone,date<br>";
            for (var i = 0; i < users.length; i++) {
                delete users[i].password;
                delete users[i].verify;
                delete users[i]["password"];
                output +=
                    "" +
                    users[i].name +
                    "," +
                    users[i].lastname +
                    "," +
                    users[i].email +
                    "," +
                    users[i].institution +
                    "," +
                    users[i].phone +
                    "," +
                    users[i].createdAt +
                    "<br>";
                // console.log(users[i])
            }
            res.send(output);
        })
        .catch(function (err) {
            console.log("Oops! something went wrong, : ", err);
        });
}

var loginAddress = "login/login.ejs";
var forgetAddress = "login/forget.ejs";


function login(req, res) {
    if (!req.session.user)
        res.render(loginAddress, {
            user: req.session.user,
            message: "",
            otp: null,
        });
    else {
        res.redirect("/bot");
    }
}



function convolist(req, res) {
    //res.json([{name:"Indian Sweets",difficulty:'Medium',type:"Profitability",cid:1},{name:"Mexican Drug Cartel",difficulty:'Easy',type:"Profitibiltiy",cid:2},{name:"Vodka Manufacturer",difficulty:'Medium',type:"Profitability",cid:3}]);
    console.log('from convolist');
    console.log(req.session.user);
    PaidUser.findOne({ where: { email: req.session.user.email } }).then(function (user) {
        if (!user) {
            res.json([
                {
                    name: "Indian Sweets",
                    difficulty: "Intermediate",
                    type: "Profitability",
                    cid: 1,
                },
                {
                    name: "Mexican Drug Cartel",
                    difficulty: "Beginner",
                    type: "Profitability",
                    cid: 2,
                },
            ]);
        } 
        else {
          res.json([
                {
                    name: "Indian Sweets",
                    difficulty: "Intermediate",
                    type: "Profitability",
                    cid: 1,
                },
                {
                    name: "Mexican Drug Cartel",
                    difficulty: "Beginner",
                    type: "Profitability",
                    cid: 2,
                },{name:"Vodka Manufacturer",difficulty:'Intermediate',type:"Profitability",cid:3}
            ]);
        }
    }).catch((err) => {
        console.log(err);
    });
    
}

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.session.user) return next();
    res.redirect("/");
}

function chatbot(req, res) {
    if (process.env.ENV == "test") {
        res.render("chat.ejs", {
            user: req.session.user,
        });
    } else {
        isLoggedIn(req, res, () => {
            res.render("chat.ejs", {
                user: req.session.user,
            });
        });
    }
}

function logout(req, res) {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie("user_sid");
        res.redirect("/");
    } else {
        res.redirect("/");
    }
}

function loginpost(req, res) {
    var email = req.body.email,
        password = req.body.password;

    User.findOne({ where: { email: email } }).then(function (user) {
        if (!user) {
            res.render(loginAddress, {
                user: null,
                message: "User does not exist",
                otp: null,
            });
        } else if (!user.validPassword(password)) {
            res.render(loginAddress, {
                user: null,
                message: "Oops! wrong password",
                otp: null,
            });
        }
        // else if(user.verify ===0){
        //     // checkEmail(user.email);
        //     res.render('login/login.ejs',{
        //         user:null,
        //         message: 'Please verify your account email sent'
        //  });
        // }
        else {
            req.session.user = user.dataValues;
            res.redirect("/bot");
        }
    }).catch((err) => {
        console.log(err);
    });
}

function checkEmail(email) {}

function failedSignup(res, msg, otp = null) {
    res.render(loginAddress, {
        user: null,
        message: msg,
        otp: otp,
    });
}

function failedForget(res, user, msg, otp = false) {
    res.render(forgetAddress, {
        user: user,
        message: msg,
        otp: otp,
    });
}

function forget(req, res) {
    if (!req.session.user)
        res.render(forgetAddress, {
            user: req.session.user,
            message: "",
            otp: null,
        });
    else {        
        res.redirect("/bot");
    }
}

function forgetPost(req, res) {
    const user = req.body;
    if (!user) return failedForget(res, null, "No user data found");
    if (
        !user.email.match(
            /^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/
        )
    ) {
        // console.log('%s: Invalid email entered - %s', utils.logTime(), user.email);
        return failedForget(res, null, "Please enter a valid Email Address");
    }
    const generatedOTP = crypto
        .createHash("md5")
        .update(user.email + "secretKey")
        .digest("hex")
        .substring(0, 6);
    if (!user.otp) {
        console.log("mailing otp " + generatedOTP);
        mailer.forgetMail(user.email, generatedOTP);
        return failedForget(
            res,
            user,
            "An email containing OTP has been sent.Please fill the OTP in form",
            true
        );
    }
    if (!user.password) return failedForget(res, user, "password not found");
    if (user.otp != generatedOTP) {
        console.log("mailing otp " + generatedOTP);
        mailer.forgetMail(user.email, generatedOTP);
        return failedForget(res, user, "Incorrect OTP, OTP resent", true);
    }
     User.findOne({ where: { email: user.email } }).then(function (users) {
        return users.update({password:user.password })
    }).catch((err) => {
        console.log(err);
    });
    res.redirect('/');
}

function signuppost(req, res) {
    const user = req.body;

    if (!user) return failedSignup(res, "No user data found");
    if (
        !user.email.match(
            /^[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/
        )
    ) {
        // console.log('%s: Invalid email entered - %s', utils.logTime(), user.email);
        return failedSignup(res, "Please enter a valid Email Address");
    }
    const generatedOTP = crypto
        .createHash("md5")
        .update(user.email + "secretKey")
        .digest("hex")
        .substring(0, 6);
    if (!user.otp) {
        console.log("mailing otp " + generatedOTP);
        mailer.sendMail(user.email, generatedOTP);
        return failedSignup(
            res,
            "An email containing OTP has been sent.Please fill the OTP in form",
            true
        );
    }
    if (!user.first_name || !user.last_name)
        return failedSignup(res, "first name or last name not found");
    if (!user.password) return failedSignup(res, "password not found");
    if (!user.institution)
        return failedSignup(res, "College/ company name not found");

    if (user.otp != generatedOTP) {
        console.log("mailing otp " + generatedOTP);
        mailer.sendMail(user.email, generatedOTP);
        return failedSignup(res, "Incorrect OTP, OTP resent", true);
    }

    User.create({
        name: req.body.first_name,
        lastname: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        institution: req.body.institution,
        phone: req.body.phone,
        Role: "user",
        verify: 1,
    })
        .then((user) => {
            // checkEmail(req.session.user.email);
            req.session.user = user.dataValues;
            res.redirect("/bot");
        })
        .catch((error) => {
            res.render(loginAddress, {
                user: null,
                message: "Email id is already in use",
                otp: null,
            });
        });
}

// route for user's dashboard
// app.get('/dashboard', (req, res) => {
//     if (req.session.user && req.cookies.user_sid) {
//         res.sendFile(__dirname + '/public/dashboard.html');
//     } else {
//         res.redirect('/login');
//     }
// });
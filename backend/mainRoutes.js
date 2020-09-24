var express = require('express');
var router = express.Router({mergeParams: true});

var mainController = require('./mainControllers');

router.route('/').get(mainController.login);
router.route('/signup').post(mainController.signuppost);
router.route('/login').post(mainController.loginpost);
router.route('/logout').get(mainController.logout);
router.route('/getconvolist').post(mainController.convolist);
router.route('/bot').get(mainController.chatbot);
router.route('/pdf/:id').get(mainController.pdfChat);
router.route('/pdfc').post(mainController.pdfChat1);
router.route('/forget').get(mainController.forget);
router.route('/forget').post(mainController.forgetPost);
router.route('/order').get(mainController.createOrder);
router.route('/success').post(mainController.successfulOrder);
router.route('/history').get(mainController.feedback);
router.route('/allchatsforsidanasir').get(mainController.allchat);
router.route('/alluserrecords').get(mainController.allusers);

module.exports = router;
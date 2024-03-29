const express = require('express')
const authController = require('../controller/auth')
const router = express.Router();

router.get('/login',authController.getLogin)
router.get('/signup',authController.getSignup)
router.post('/signup' , authController.postSignup)
router.post('/login', authController.postLogin)
router.post('/logout', authController.postLogout)
router.get('/reset',authController.getReset)
router.post('/reset',authController.postReset)
router.get('/reset/:token',authController.getNewPassword)
router.post('/new-password',authController.postNewPassword)
router.get('/update-password',authController.getUpdatePassword)
router.post('/update-password',authController.postUpdatePassword)
module.exports = router;
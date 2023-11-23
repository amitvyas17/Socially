const User = require('../models/users')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const crypto = require('crypto')
const sendResetLink = require('../utils/reset-mail')
exports.getLogin = (req,res,next) =>{
    const errorMessages = req.flash('error');
    // console.log(errorMessages)
    res.render('auth/login',{subBtn:'Signup' , messages: errorMessages})
}
exports.postLogin = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            req.flash('error', 'The user does not exist');
            return res.redirect('/login');
        }

        const doMatch = await bcrypt.compare(password, user.password);

        if (doMatch) {
            req.session.user = user;
            req.session.isLoggedin = true;

            req.session.save((err) => {
                if (err) {
                    console.log(err);
                    req.flash('error', 'Error saving session');
                    return res.redirect('/login');
                }

                console.log('Session saved successfully');
                return res.redirect('/timeline');
            });
        } else {
            req.flash('error', 'Invalid password');
            return res.redirect('/login');
        }
    } catch (err) {
        console.log(err);
        req.flash('error', 'An error occurred');
        res.redirect('/login');
    }
};

exports.getSignup = (req,res,next) =>{
    res.render('auth/signup' ,{alertMessage : "",subBtn : 'Login'})
}

exports.postSignup = (req,res,next) =>{
    console.log(req.body.email)
    const email = req.body.email
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    const gender = req.body.gender
    const imagePath = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRISuukVSb_iHDfPAaDKboFWXZVloJW9XXiwGYFab-QwlAYQ3zFsx4fToY9ijcVNU5ieKk&usqp=CAU'
    const description = "Hey i am new to Socially let's connect!"
    User.findOne({email:email})
    .then(existingUser=>{
        if(existingUser){
            alertMessage = 'The User with same email already exists'
            console.log(alertMessage)
            return res.render('auth/signup' , {alertMessage : alertMessage , subBtn : 'Login'})

        }
        return bcrypt.hash(password,12)
        .then(hashedPassword=>{
            const user = new User({
                firstName : firstName,
                lastName:lastName,
                email:email,
                description:description,
                imagePath:imagePath,
                password:hashedPassword,
                gender:gender,
                friends:[],
                sentRequest:[],
                receivedRequest:[]


            })
             return user.save()
        })
         .then(result=>{
            console.log('The user has been created')
            res.redirect('/login')
        })
        .catch(err=>{
            console.log(err)
            const alertMessage = 'There is a error while creating the user'
            console.log(alertMessage)
            return res.render('auth/signup' , {alertMessage : alertMessage ,subBtn : 'Login'})
        })
    })
    .catch(err=>{
        // console.log(err)
        const alertMessage = 'There has been error while creating/fetching the user'
        console.log(alertMessage)
        return res.render('auth/signup' , {alertMessage : alertMessage, subBtn : 'Login'})
    })

}

exports.postLogout = (req,res,next) =>{
    req.session.destroy(err=>{
        console.log(err)
        console.log('The user has been logged out')
        res.redirect('/login')
    })
}
exports.getReset = (req,res,next) =>{
    res.render('auth/reset')
}
exports.postReset = (req,res,next) =>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
            return res.redirect('/reset')
        }
    const token = buffer.toString('hex')

    

    const userEmailId = req.body.email

    User.findOne({email:userEmailId})
        .then(user=>{
            if(!user){
                console.log('No User Found!')
                res.render('auth/reset')
                
            }
            user.resetToken=token;
            user.resetTokenExpiration = Date.now()+3600000
            user.save()
            
        })
        .then(user=>{
            sendResetLink(userEmailId,`http://localhost:3000/reset/${token}`)
            console.log('The reset Link has been sent to '+userEmailId)
            res.redirect('/login')
            
        })
        .catch(err=>{
            console.log(err)
            res.redirect('/reset')
        })
    })
}
exports.getNewPassword = (req,res,next) =>{
    const token = req.params.token

    User.findOne({resetToken:token,resetTokenExpiration:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            console.log('Error Bad Request!')
            return res.redirect('/login')
        }
        res.render('auth/password-change',
        {
            token:token,
            userId:user._id.toString()
        })

    })
}
exports.postNewPassword = (req,res,next) =>{
    const newPassword = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.token
    let resetUser;
    User.findOne({resetToken:passwordToken,_id:userId,resetTokenExpiration:{$gt:Date.now()}})
    .then(user=>{
        resetUser=user;
        return  bcrypt.hash(newPassword,12)
    })
    .then(hashedPassword=>{
        resetUser.password=hashedPassword
        resetUser.resetToken=undefined
        resetUser.resetTokenExpiration=undefined
        resetUser.save()
    })
    .then(result=>{
        console.log('The password has been updated')
        res.redirect('/login')
    })
    .catch(err=>{
        console.log(err)
    })
}
exports.getUpdatePassword = (req,res,next) =>{
    res.render('auth/update-password',{
        subBtn:'Logout',
        loggedInUser:req.session.user.firstName,
    })
}
exports.postUpdatePassword = async (req,res,next) =>{
    try{
    const userId = req.session.user._id;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword
    const confirmPassword = req.body.confirmPassword

    console.log(currentPassword,newPassword,confirmPassword)
    const user = await User.findById(userId)
    const doMatch = await bcrypt.compare(currentPassword,user.password)
    if(doMatch){
        if(newPassword===confirmPassword){
        user.password =await bcrypt.hash(newPassword,12)
        await user.save()
        }
        else{
            console.log('The password do not match')
            return res.redirect('/update-password')
            
        }
        req.session.destroy(err=>{
            if(err){
            console.log(err,'There is a error deleting the session')
            }
        })
        console.log('The user password has been updated!!')
        res.redirect('/login')
        
    }
    else{
        console.log('You are not authorized to update the password')
        res.redirect('/update-password')
    }
}catch(err){
        console.log(err)
        res.redirect('/update-password')
    }
}
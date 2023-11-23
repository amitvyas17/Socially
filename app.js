const express = require('express')
const path = require('path')
const app = express()
const auth = require('./routes/auth')
const timeline = require('./routes/timeline')
const session = require('express-session')
require('dotenv').config();
const MongoDBStore = require('connect-mongodb-session')(session)
const flash = require('connect-flash')
const mongoose = require('mongoose')
app.set('view engine' , 'ejs')
app.set('views' , 'views')
const MONGODB_URI = process.env.MONGODB_URI
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname,'public')))
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection:'sessions'
})

app.use(session({secret : 'my secret' , resave:false , saveUninitialized: false , store :store,cookie: {
    maxAge: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
  }}))
app.use(flash())   
app.use(auth)
app.use(timeline)


mongoose.connect(MONGODB_URI)
.then(result=>{
    app.listen(3000, ()=>{
        console.log('The Server is running on port 3000')
    })
})
.catch(err=>{
    console.log(err)
})

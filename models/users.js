const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const sentRequestSchema = new Schema(
   
)
const friendsSchema = new Schema({
    userId: {type:Schema.Types.ObjectId ,ref:'User'},
    status : {type:String}
},{
    _id:false
})

const userSchema = new Schema({
    firstName :{
        type:String,
        required:true
    },
    lastName :{
        type:String,
        required :true
    },
    email :{
        type :String,
        required:true
    },
    description:{
        type:String,

    },
    imagePath:{
        type:String
    },
    password:{
        type :String,
        required: true
    },
    gender:{
        type:String,
        required:true
    },
    friends:[friendsSchema],
    sentRequest:[ { type: Schema.Types.ObjectId, ref: 'User' }],
    receivedRequest:[ { type: Schema.Types.ObjectId, ref: 'User' }],
    savedPosts:[{type:Schema.Types.ObjectId , ref:'Post'}],
    resetToken:String,
    resetTokenExpiration:Date
    
})

module.exports = mongoose.model('User' , userSchema)
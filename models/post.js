const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const postSchema  = new Schema({
    
    posts : [
        {
            postText : {
                type:String
            },
            postImage : {
                type:String
            },
            createdAt:{
                type:Date,
                default:Date.now
            },
            userId : {
                type : Schema.Types.ObjectId,
                ref:'User',
                required:true
            },
            likes:{
                type:Number,
                default:0,
                
            },
            likedBy: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
            ],
            comments:[{
                text:{
                    type:String
                },
                userId:{
                    type:Schema.Types.ObjectId,
                    ref:'User',
                    required:true
                },
                _id: false,
        }]

        },
         
    ]
})

module.exports = mongoose.model('Post' , postSchema)
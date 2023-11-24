const Post = require('../models/post')
const User = require('../models/users')
const mongoose = require('mongoose')


exports.getTimeline = async (req, res, next) => {
    try {
        // console.log(req.session)
        // Step 1: Fetch posts from the database
        const posts = await Post.find().sort({ 'posts.createdAt': 'desc' }).populate('posts.userId posts.likedBy') || [];
       const loggedInUserInSession =  await User.findById(req.session.user._id)
        // console.log('this is post ' +posts[0].posts)
        if(posts.length>0){
        const allPosts = posts[0].posts.map(post=>{
            return {...post._doc , userFirstName:post.userId.firstName,userLastName:post.userId.lastName,userId:post.userId._doc}
        })
        allPosts.reverse()
        if (req.session.isLoggedin == true && posts.length > 0) {
            console.log(loggedInUserInSession)

            const likedPosts = allPosts.map(post => {
                const postUserId = post.userId._id.toString();
                // console.log(post)
                const isLikedByUser = post.likedBy.some(userId => userId._id.toString() === req.session.user._id.toString());
                const isSavedByUser = req.session.user.savedPosts && req.session.user.savedPosts.some(savedPostId => savedPostId.equals(post._id));
                const isCreatedBySessionUser = post.userId._id.toString() === req.session.user._id.toString()
                const isCreatedByFriend = loggedInUserInSession.friends && loggedInUserInSession.friends.some(friend => {
                    console.log("Friend userId:", friend.userId.toString());
                    console.log("Post userId:", postUserId);
                    return friend.userId.toString() === postUserId;
                });
                
                console.log("isCreatedByFriend:", isCreatedByFriend);

                
                return { ...post, isLikedByUser,isSavedByUser,isCreatedBySessionUser,isCreatedByFriend, };
              });
            //   console.log(req.session.user)
            //   console.log(likedPosts)
            res.render('timeline/post', {
                subBtn: 'Logout',
                message: '',
                posts: likedPosts,
                loggedInUser:req.session.user.firstName,
                userPic:req.session.user.imagePath
            });
        } else {
            res.render('timeline/post', {
                subBtn: 'Login',
                message: 'Kindly login to see others post or to post something',
                posts: [],
                loggedInUser:req.session.user.firstName,
                userPic:req.session.user.imageUrl

            });
        }
    }   
    else{
        res.render('timeline/post', {
            subBtn: 'Logout',
            message: '',
            posts: [],
            loggedInUser:req.session.user.firstName,
            userPic:req.session.user.imageUrl
        });
    }

       
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.savePost = (req,res,next) =>{
    const postText = req.body.postText
    const postImage = req.body.postImage

    Post.findOne()
    .then(existingPost=>{
        if(!existingPost){
            const post  = new Post({
                posts:[{
                    postText:postText,
                    postImage:postImage,
                    userId:req.session.user
        
            }]
            })
           return post.save()
        .then(savedPost=>{
            res.redirect('/timeline')
            console.log('post saved success')
        })
        }
        else{
            existingPost.posts.push({
                    postText:postText,
                    postImage:postImage,
                    userId:req.session.user
            })
            return existingPost.save()
            .then(savedPost=>{
                res.redirect('/timeline')
                console.log('post saved success')
            })
        }
    })
    
   
    
}
exports.getFriends =(req,res,next) =>{
 
    User.find()
    
    .then(users=>{  
        const loggedInUser = req.session.user
        if(users && req.session.isLoggedin==true){
            // console.log(loggedInUser)
            // console.log(users)
            // console.log(loggedInUser.sentRequest)
            const allUsers = users.filter(i => {
                const isNotLoggedInUser = i._id.toString() !== req.session.user._id.toString();
            
                // Check if the user is not the logged-in user and is not in the friends list
                const isNotFriends = loggedInUser.friends && loggedInUser.friends.every(friendUserId => friendUserId.userId.toString() !== i._id.toString());
            
                const isNotInSentRequest = loggedInUser.sentRequest.every(friendUserId => friendUserId.toString() !== i._id.toString());
            
                // console.log(`User ${i._id}: isNotLoggedInUser=${isNotLoggedInUser}, isNotFriends=${isNotFriends}, isNotInSentRequest=${isNotInSentRequest}`);
            
                return isNotLoggedInUser && isNotFriends && isNotInSentRequest;
            });
            
            
        // console.log(allUsers)
        if(req.session.isLoggedin==true){
            // const loginUser = req.session.user;
            // console.log(loginUser.friends)
            
            
            // console.log(allUsers)




            res.render('timeline/add-friend',{
                subBtn: 'Logout',
                message:'',
                users:allUsers,
                loggedInUser:req.session.user.firstName
            })
        }
         else{
            res.render('timeline/add-friend',{
                subBtn: 'Login',
                message:'Kindly login to see friends',
                users:''
            })
        }
    }
    else{
        res.render('timeline/add-friend',{
            subBtn: 'Login',
            message:'Kindly login to see friends',
            users:''
             })
        }
})
    .catch(err=>{
        console.log(err)
    })
  
}
exports.getAllFriends = (req,res,next) =>{
    User.findById(req.session.user)
        .populate('friends.userId')
        .select('friends.userId friends.status')
        .then(user=>{
            // console.log(user)
            const friends = user.friends.filter(friend=>friend.status==='Friends').map(friend=>({friend : friend.userId, status : friend.status}))
            // console.log(friends)
            return friends
        })
        .then(friends=>{
            // console.log(friends)
            const user = req.session.user

            if(req.session.isLoggedin==true){
                res.render('timeline/friends',{
                    subBtn: 'Logout',
                    message:'',
                    friends:friends,
                    loggedInUser:req.session.user.firstName

                    
                })
            }else{
                res.render('timeline/friends',{
                    subBtn: 'Login',
                    message:'Kindly login to see others post or to post something',
                    friends:friends,
                    loggedInUser:req.session.user.firstName

                })
        }
    })
        .catch(err=>{
            console.log(err)
        })
}




exports.getUserProfile = (req,res,next) =>{

    const user = req.session.user
    console.log(user)

    if(req.session.isLoggedin==true){
        res.render('timeline/userProfile',{
            subBtn: 'Logout',
            message:'',
            user:user,
            loggedInUser:req.session.user.firstName
            
        })
    }else{
        res.render('timeline/userProfile',{
            subBtn: 'Login',
            message:'Kindly login to see others post or to post something',
            user:user,
            loggedInUser:req.session.user.firstName

        })
    }
    
}
exports.postUpdateProfile = (req,res,next) =>{
    const userId = req.body.userId
    const updatedFirstName = req.body.firstName
    const updatedLastName = req.body.lastName
    const updatedEmail = req.body.email
    let imagePath;
    const description = req.body.postText
    const updatedGender = req.body.gender
    if(req.body.imagePath){
        imagePath = req.body.imagePath
    }else{
        imagePath = req.session.user.imagePath
    }
    
    User.findOneAndUpdate({_id:userId},{
        
            firstName:updatedFirstName,
            lastName:updatedLastName,
            email:updatedEmail,
            description:description,
            imagePath:imagePath,
            gender:updatedGender
        
    },{new:true})
    .then(updatedUser=>{
        req.session.user = updatedUser
        console.log('User Updated Successfully')
        res.redirect('/user-profile')
    })
    .catch(err=>{
        console.log(err)
    })

}

exports.postAddFriend = (req,res,next) =>{
    const friendId = req.body.userId
    User.findOneAndUpdate({_id : req.session.user},
        {
         
            $push:{
                sentRequest:new mongoose.Types.ObjectId(friendId)
            },
            
        },
        {new:true})
    .then(updatedUser=>{
        console.log('updated user '+updatedUser)
        req.session.user=updatedUser
        User.findOneAndUpdate({_id : friendId},
            {
                // $push:{
                //     friends:{
                //         userId:friendId,
                //         status:'Pending'
                //     },
                $push:{
                    receivedRequest:new mongoose.Types.ObjectId(req.session.user._id)
                },
                
            },
            {new:true})
            .then(result=>{
                
                console.log('Friend Request Sent')
                res.redirect('/friend-add')
            })
            .catch(err=>{
                console.log(err)
            })
        
    })
    .catch(err=>{
        if(err){
            console.log(err + ' Could not update the user')
            res.redirect('/friends')
        }
    })
}
exports.getNotifications = (req,res,next) =>{
    const user = req.session.user
    User.findById(user)
    .populate({
        path: 'receivedRequest', // Specify the nested path
        model: 'User' // Specify the model to populate from (assuming 'User' is the model name)
      })
    .select('receivedRequest')
    .then(users=>{
        // console.log(users.receivedRequest)
        const friends = users.receivedRequest
        return friends
    })
    .then(friends=>{
        if(req.session.isLoggedin==true){
            res.render('timeline/notifications',{
                subBtn: 'Logout',
                message:'',
                friends:friends,
                loggedInUser:req.session.user.firstName
                
            })
        }else{
            res.render('timeline/notifications',{
                subBtn: 'Login',
                message:'Kindly login to see others post or to post something',
                friends:[],
                loggedInUser:req.session.user.firstName

            })
        }
    })
    .catch(err=>{
        console.log(err)
        res.redirect('/timeline')
    })


   
}
exports.postAcceptFriend = async (req,res,next) =>{
    console.log(req.body)
    const friendId = req.body.userId
    if(req.body.btnValue == 'accept'){
      const result = await  User.findOneAndUpdate({_id : friendId},
            {
                // $push:{
                //    ,
                $push:{
                    friends:{
                                userId:req.session.user,
                                status:'Friends'
                            },
                    
                },
                $pull:{
                    sentRequest:req.session.user._id
                }
                
            },
            {new:true})
            
            const sessionUserUpdate= await User.findOneAndUpdate({_id : req.session.user},
                    {
                        // $push:{
                        //    ,
                        $push:{
                            friends:{
                                        userId:friendId,
                                        status:'Friends'
                                    },
                        },
                        $pull:{
                            receivedRequest:friendId,
                        }
                        
                    },
                    {new:true})
                    console.log('sessionuserupdate  '+sessionUserUpdate)
            req.session.user = sessionUserUpdate
            console.log('The session user has been updated...' + req.session.user)
            res.redirect('/notifications')
            

    }else{
      const result =  await User.findOneAndUpdate({_id : friendId},
            {
                $pull:{
                    sentRequest:req.session.user._id
                }
                
                
            },{new:true})
           
           const sessionUserUpdate = await User.findOneAndUpdate({_id : req.session.user._id},
                    {
                        $pull:{
                            receivedRequest:friendId
                        }
                        
                    },{new:true})
                req.session.user = sessionUserUpdate
                        console.log('The session user of else condition ...'+req.session.user)
                        console.log('Request Rejected')
                        res.redirect('/notifications')
                   

    }



    // User.findById(req.session.user)
    // .populate('friends.userId')
    // .select('friends.userId friends.status')
    // .then(async user=>{
    //      const fetchedFriend = user.friends.findIndex(friendObj=> friendObj.userId._id.toString() === userId.toString())
    //     // console.log(fetchedFriend[0].status)
    //     //  fetchedFriend[0].status = 'accept'
    //      user.friends[fetchedFriend].status = 'Accept'
    //        return await user.save()
    // })
    // .then(result=>{
        

    //     console.log('Friend Added')
    // })
    // .catch(err=>{
    //     console.log(err)
    // })
}

exports.getSentRequest = (req,res,next) =>{
    const user = req.session.user
    User.findById(user)
    .populate({
        path: 'sentRequest', // Specify the nested path
        model: 'User' // Specify the model to populate from (assuming 'User' is the model name)
      })
    .select('sentRequest')
    .then(users=>{
        // console.log(users.sentRequest)
        const friends = users.sentRequest
        return friends
    })
    .then(friends=>{
        if(req.session.isLoggedin==true){
            res.render('timeline/sent-request',{
                subBtn: 'Logout',
                message:'',
                friends:friends,
                loggedInUser:req.session.user.firstName
                
            })
        }else{
            res.render('timeline/sent-request',{
                subBtn: 'Login',
                message:'Kindly login to see others post or to post something',
                friends:[],
                loggedInUser:req.session.user.firstName

            })
        }
    })
    .catch(err=>{
        console.log(err)
        res.redirect('/timeline')
    })


}
exports.postWithdrawRequest = (req,res,next) =>{
    // console.log(req.body)
    const friendId = req.body.userId
    User.findOneAndUpdate({_id:req.session.user},{
        $pull:{
            sentRequest:friendId
        }
    },{new:true})
    .then(result=>{
        // console.log(result)
        req.session.user=result;
        console.log('Request Withdrawn')
        res.redirect('/sent-request')
    })
    .catch(err=>{
        console.log(err)
    })
}
exports.postRemoveFriend = async (req,res,next) =>{
    try {
    const friendId = req.body.userId
    // console.log(friendId)

    const result = await User.findOneAndUpdate(
        { _id: req.session.user._id },
        { $pull: { 'friends' : friendId } },
        { new: true }
    );
    const result2 = await User.findOneAndUpdate(
        { _id: friendId },
        { $pull: { 'friends' : req.session.user._id } },
        { new: true }
    );
    req.session.user=result
    console.log("Result....."+result)
    console.log("result2....."+result2)
    console.log("User....."+req.session.user)
    console.log('unfriend friend')
    res.redirect('/friends')

} catch (error) {
    console.error(error);
    // Handle the error appropriately (send a response, log, etc.)
    res.redirect('/friends')
    res.status(500).send('Internal Server Error');
}



    
        
   

}
exports.postDeletePost = (req,res,next) =>{
    // console.log(req.body.userId)
    // console.log(req.body.postId)
    const userId = req.body.userId
    const postId = req.body.postId
    if(userId.toString()!==req.session.user._id.toString()){
        console.log('User is not allowed to delete this post')
        // throw new Error("You are not allowed to delete this post")
        return res.redirect('/timeline')
    }
    Post.find()
    .then(posts=>{
        const allPosts = posts[0].posts
        const postIndex = allPosts.findIndex(i=>i._id.toString() === postId.toString())
        return {posts,allPosts,postIndex};

    })
    .then(({posts,allPosts ,postIndex})=>{
        if (postIndex === -1) {
            console.log('Post not found');
            return res.redirect('/timeline');
        }
        allPosts.splice(postIndex,1)
        console.log('Post deleted success')
        return posts[0].save()
    })
    .then(deletedPost=>{
        // console.log(deletedPost)

        res.redirect('/timeline')
    })
    .catch(err=>{
        console.log(err)
        res.redirect('/timeline')
    })

}
exports.postLike = async (req,res,next) =>{
    try{
    const postId = req.body.postId
    const userId = req.session.user._id
    const redirectPage = req.body.redirectPage.toString()
    // console.log(postId)
    const result = await Post.findOneAndUpdate(
        {'posts._id' : postId},
        {
            $inc:{'posts.$.likes' :1},
            $push:{'posts.$.likedBy': new mongoose.Types.ObjectId(userId)}
        },
        {new:true}
        );
        if(!result){
            console.log('Post not found');
            return res.redirect(redirectPage)
        }
        console.log('Likes: '+result.posts.find(i=>i._id.toString() === postId.toString()))
        return res.redirect(redirectPage)
    }
    catch(err){
        console.log(err)
        res.redirect(redirectPage)
    }

}
exports.postDislike = async (req,res,next) =>{
    try{
    const postId = req.body.postId
    const userId = req.session.user._id
    const redirectPage = req.body.redirectPage.toString()
    // console.log(postId)
    const result = await Post.findOneAndUpdate(
        {'posts._id' : postId},
        {
            $inc:{'posts.$.likes' :-1},
            $pull:{'posts.$.likedBy': new mongoose.Types.ObjectId(userId)}
        },
        {new:true}
        );
        if(!result){
            console.log('Post not found');
            return res.redirect(redirectPage)
        }
        console.log('Likes: '+result.posts.find(i=>i._id.toString() === postId.toString()))
        return res.redirect(redirectPage)
    }
    catch(err){
        console.log(err)
        res.redirect(redirectPage)
    }

}
exports.getPostView = async (req, res, next) => {
    try {
        const postId = req.params.postId;

        const allPosts = await Post.find();
        const index = allPosts[0].posts.findIndex(i => i._id.toString() === postId.toString());
        const post = allPosts[0].posts[index];

        const isLikedByUser = post.likedBy.some(userId => userId.toString() === req.session.user._id.toString());
        const isSavedByUser = req.session.user.savedPosts && req.session.user.savedPosts.some(savedPostId => savedPostId.equals(post._id));

        // Populate user details for the post
        await Post.populate(post, { path: 'userId', select: 'firstName lastName imagePath' });

        // Populate user details for the comments
        await Post.populate(post, { path: 'comments.userId', select: 'firstName lastName imagePath' });

        res.render('timeline/post-view', {
            subBtn: 'Logout',
            post: post,
            loggedInUser:req.session.user.firstName,
            isSavedByUser:isSavedByUser,
            isLikedByUser:isLikedByUser
            
           
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
};

exports.postComment = async (req,res,next) =>{
    try{
        const postId = req.body.postId
        const userId = req.session.user._id
        const comment = req.body.comment
        // console.log(postId,comment)
        const result = await Post.findOneAndUpdate(
            {'posts._id' : postId},
            {
                $push:{'posts.$.comments': {text:comment,userId:new mongoose.Types.ObjectId(userId)}}
            },
            {new:true}
            ).populate('posts.comments.userId', 'firstName lastName imagePath')
            if(!result){
                console.log('Post not found');
                return res.redirect(`/post-view/${postId}`)
            }
            console.log(result.posts.userId)
            return res.redirect(`/post-view/${postId}`)
        }
        catch(err){
            console.log(err)
            res.redirect(`/post-view/${postId}`)
        }
    }
exports.postSavePost = async (req,res,next) =>{
    const postId = req.body.postId
    const userId = req.session.user._id
    const redirectPage = req.body.redirectPage.toString()

    try {
        const result = await User.findOneAndUpdate(
            { _id: userId },
            { $push: { 'savedPosts': postId } },
            { new: true }
        );
        // console.log(req.session.user)
        req.session.user= result;
        // console.log('after session update '+ req.session.user)
        res.redirect(redirectPage)
    } catch (error) {
        console.error(error);
        // Handle the error appropriately (send a response, log, etc.)
        res.redirect(redirectPage)
        res.status(500).send('Internal Server Error');
    }


}
exports.removeSavePost = async (req,res,next) =>{
    const postId = req.body.postId
    const userId = req.session.user._id
    const redirectPage = req.body.redirectPage.toString()

    try {
        const result = await User.findOneAndUpdate(
            { _id: userId },
            { $pull: { 'savedPosts': postId } },
            { new: true }
        );
        // console.log(req.session.user)
        req.session.user= result;
        // console.log('after session update '+ req.session.user)
        res.redirect(redirectPage)
    } catch (error) {
        console.error(error);
        res.redirect(redirectPage)
        // Handle the error appropriately (send a response, log, etc.)
        res.status(500).send('Internal Server Error');
    }


}        
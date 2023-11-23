const express = require('express')

const router = express.Router();
const postController = require('../controller/timeline')

router.get('/timeline', postController.getTimeline)
router.post('/post' , postController.savePost)
router.get('/friend-add',postController.getFriends)
router.get('/friends',postController.getAllFriends)
router.get('/user-profile',postController.getUserProfile)
router.post('/update-profile' , postController.postUpdateProfile)
router.post('/add-friend',postController.postAddFriend)
router.post('/remove-friend',postController.postRemoveFriend)
router.get('/notifications' , postController.getNotifications)
router.post('/accept-friend' , postController.postAcceptFriend)
router.get('/sent-request',postController.getSentRequest)
router.post('/withdraw-request' , postController.postWithdrawRequest)
router.post('/delete-post' , postController.postDeletePost)
router.post('/like-post' , postController.postLike)
router.post('/dislike-post' , postController.postDislike)
router.get('/post-view/:postId' , postController.getPostView)
router.post('/add-comment' , postController.postComment)
router.post('/save-post' , postController.postSavePost)
router.post('/remove-save-post' , postController.removeSavePost)


module.exports = router;
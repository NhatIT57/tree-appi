const express = require("express");
const multer = require("multer");
const jwtUtil = require("./utils/jwt.util");
// const multerConfig = require('./config/upload');

const uploadConfig = require("./config/upload");
const UserController = require("./controllers/UserController");
const PetController = require("./controllers/PetController");
const PostController = require("./controllers/PostController");
const CommentController = require("./controllers/CommentController");
const LikeController = require("./controllers/LikeController");
const AuthController = require("./controllers/AuthController");
const ComplaintController = require("./controllers/ComplaintController");
const ImageController = require("./controllers/ImageController");
const FollowController = require("./controllers/FollowController");
const ChatController = require("./controllers/ChatController");

const routes = express.Router();
const upload = multer(uploadConfig);

const admin = async (req, res, next) => {

    if (req.headers["x-token"]) {
        const token = req.headers["x-token"].toString();
        try {
            const user = jwtUtil.verify(token);
            if (user.isAdmin) {
                next();
                return;
            }
        } catch (exception) {
            res.status(401);
            res.send("Unauthorized");
        }
    }
    res.status(401);
    res.send("Unauthorized");
};

const jwt = async (req, res, next) => {
    if (req.headers["x-token"]) {
        const token = req.headers["x-token"].toString();
        try {
            const user = jwtUtil.verify(token);
            if (user) {
                req.body.user = user;
                next();
                return;
            }
        } catch (exception) {
            res.status(401);
            res.send("Unauthorized");
        }
    }
    res.status(401);
    res.send("Unauthorized");
};

//#region
//FUNCTION NEED REMOVING {

//showallusers;
//getuserbyid;
//deleteuserbyemail;

//showallpets
//deleteallpets

//showallposts;
//showallcomments;

//showsessions;
//gettrue;
//deleteallauth;
//  }
//#endregion
routes.get("/", jwt, UserController.commandList); //OK//

//IMAGE routes
routes.post(
    "/createimage",
    upload.single("image"),
    ImageController.createImage
); //OK//
routes.get("/getimagebykey", ImageController.getImageByKey); //OK//
routes.get("/showallimages", ImageController.showAllImages); //OK//
routes.delete("/deleteimagebykey", ImageController.deleteImageByKey); //OK//

//USER routes
routes.post(
    "/setprofile",
    upload.single("profilePicture"),
    UserController.setProfilePicture
); //OK//
routes.post(
    "/updateProfile",
    UserController.updateProfile
); //OK//
routes.get("/getFile/:url", UserController.getFile);
routes.post("/createUser", UserController.createUser); //OK//
routes.post("/loginUser", UserController.loginUser); //OK//
routes.patch("/updatePasswordUser", UserController.changePasswordUser); //OK//
routes.get("/getuserbyemail", UserController.getUserByUsername); //OK//
routes.get("/showallusers", UserController.showallusers); //OK//
routes.get("/getuserbyid/:id", UserController.getUserById); //OK//
routes.post("/deleteuserbyid", admin, UserController.deleteUserById); //OK//
routes.get("/searchUserByName", UserController.searchUserByName); //OK//

//FRIEND
routes.post("/addFriend", UserController.addFriend); //OK//
routes.post("/acceptFriend", UserController.acceptFriend); //OK//
routes.post("/rejectFriend", UserController.rejectFriend); //OK//
routes.post("/cancelFriend", UserController.cancelFriend); //OK//
routes.get("/listFriend", UserController.getListFriend); //OK//
routes.get("/listInvite", UserController.getListInvite); //OK//

//CHATTING
routes.post("/createMess", ChatController.createMess); //OK//
routes.get("/historyMess", ChatController.getHistory); //OK//
routes.get("/newMess", ChatController.getLastestMess); //OK//

//PETS routes
routes.post(
    "/createflower",
    upload.single("profilePicture"),
    PetController.createflower
); //OK//
routes.get("/getpetbyuserid/:id", PetController.getPetByUserId); //OK//
routes.get("/showallFlower", PetController.showalltrees); //OK//
routes.post("/deletepet", jwt, PetController.deletepet); //OK//
//routes.delete('/deleteallpets', PetController.deleteallpets);

//UserPOST routes
routes.post("/createpost", upload.single("picture"), PostController.createPost); //OK//
routes.get("/getpostbystate", PostController.getPostByState); //OK//
routes.get("/getpostbyuserid", PostController.getPostByUserId); //OK//
routes.get("/showallposts", PostController.showAllPosts); //OK//
routes.get("/getfeed", PostController.getFeed); //OK//
routes.post("/deletepost", admin, PostController.deletePost); //OK//
routes.delete("/UserDeletePosts", PostController.UserDeletePosts); //OK//

//COMMENT routes
routes.post("/createcomment", CommentController.createComment); //OK//
routes.post("/getcommentbypostid", CommentController.getCommentByPostId); //OK//
routes.get("/showallcomments", CommentController.showAllComments); //OK//
routes.post("/deletecomment", admin, CommentController.deleteComment); //OK//

//LIKE routes
routes.post("/createlike", LikeController.createLike); //OK//
routes.get("/getlikebypost", LikeController.getLikeByPostId); //OK//
routes.get("/getpostlikecount", LikeController.getLikeCount); //OK//
routes.get("/showalllikes", LikeController.showAllLikes); //OK//

//COMPLAINT routes
routes.post("/createcomplaint", ComplaintController.createComplaint); //OK//
routes.get("/getcomplaintbypost", ComplaintController.getComplaintByPostId); //OK//
routes.get("/showallcomplaint", ComplaintController.showAllComplaint); //OK//

//AUTH routes
routes.post("/createauth", AuthController.createauth); //OK//
routes.get("/confirmauth", AuthController.confirmauth); //OK//
routes.get("/showsessions", AuthController.showAllSessions); //OK//
routes.get("/ison", AuthController.isOn); //OK//
routes.delete("/deleteauth", AuthController.deleteauth); //OK//
routes.delete("/deleteallauth", AuthController.deleteallauth); //OK//

//FOLLOW routes
routes.post("/followfunction", FollowController.followFunction);
routes.get("/getfollowerbytoken", FollowController.getFollowerByToken);
routes.get("/getfollowerbyuserid", FollowController.getFollowerByUserId);
routes.get("/getfollowingbytoken", FollowController.getFollowingByToken);
routes.get("/getfollowingbyuserid", FollowController.getFollowingByUserId);

module.exports = routes;

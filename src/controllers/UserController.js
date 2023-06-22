const Auth = require("../models/Auth");
const User = require("../models/User");
const Post = require("../models/Post");
const Pet = require("../models/Pet");
const Image = require("../models/Image");
const Comment = require("../models/Comment");
const Friend = require("../models/Friend");
const PostController = require("../controllers/PostController");
const PetController = require("../controllers/PetController");
const CommentController = require("../controllers/CommentController");

//import common
const common = require("../utils/common.util");
const jwtUtil = require("../utils/jwt.util");

//import path
const path = require("path");

//index, show, store, update, destroy

module.exports = {
  async commandList(req, res) {
    return res.status(200).json({
      "/": "This Page",
      "           /setprofile": "",
      "           /createLogin": "",
      "           /getuserbyusername": "",
      "           /showallusers": "",
      "           /getuserbyid": "",
      "           /deleteuserbyid": "",
    });
  },

  async getUserByUsername(req, res) {
    try {
      const username = await req.body.username.toLowerCase();
      const user = await User.find({ username: username });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async showallusers(req, res) {
    if (process.env.ENVIRONMENT == "dev") {
      try {
        const users = await User.find();
        return res.status(200).json(users);
      } catch (error) {
        return res.status(500).json({ "Internal Sever Error": error.message });
      }
    }
    return res.status(401).json({ error: "No system admin logged" });
  },

  async getUserById(req, res) {
    try {
      const user_id = req.params.id;
      const user = await User.find({ _id: user_id });
      return res.json(user);
    } catch (error) {
      return res.status(401).json({ error: error.message });
    }
  },

  async setProfilePicture(req, res) {
    if (req.file) {
      try {
        const { originalname: name, size, key, location: url = "" } = req.file;
        const id = req.body.id;
        try {
          const image = await Image.create({
            name,
            size,
            key,
            url,
          });

          const user = await User.findOne({ _id: id });
          user.picture = `getFile/${name}`;
          await user.save();
          return res.json(user);
        } catch (error) {
          return res
            .status(500)
            .json({ "Internal Sever Error": error.message });
        }
      } catch (error) {
        return res.status(500).json({ "Internal Server Error": error.message });
      }
    }
    return res.status(415).json({ Error: "Invalid Picture" });
  },

  async updateProfile(req, res) {

    try {
      const { id, sex, born, address, fullname } = req.body;


      const user = await User.findOne({ _id: id });

      if (user) {
        user.sex = sex;
        user.born = born;
        user.address = address;
        user.fullName = fullname;

        await user.save();
        return res.status(200).json(user);

      } return res.status(500).json({ "error": "Tài khoản không tồn tại" });



    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }

  },

  async deleteUserById(req, res) {
    try {
      const userID = req.body._id;
      const auth = await Auth.findOne({ user: userID });
      if (auth) {
        try {
          do {
            var countPet = await Pet.find({ user: auth.user });
            await PetController.UserDeleteAccount(userID);
          } while (countPet.length > 0);
        } catch (error) {
          console.log(error.message);
        }
        try {
          do {
            var countPost = await Post.find({ userID: auth.user });
            await PostController.UserDeleteAccount(userID);
          } while (countPost.length > 0);
        } catch (error) {
          console.log(error.message);
        }
        try {
          do {
            var countComment = await Comment.find({ user: auth.user });
            await CommentController.deleteCommentByComenter(userID);
          } while (countComment.length > 0);
        } catch (error) {
          console.log(error.message);
        }

        const deleteUser = await User.deleteOne({ _id: auth.user });
        const deleteAuth = await Auth.deleteOne({ _id: auth._id });
        return res
          .status(200)
          .json({ success: true, message: "Delete successfully!" });
      } else {
        return res.status(401).json({ error: "Không tìm thấy auth với id user này!" });
      }
    } catch (error) {
      return res.status(500).json({ "Internal Sever Error": error.message });
    }
  },

  getFile(req, res) {
    const url = path.join(__dirname, "../images", req.params.url);
    res.sendFile(url);
  },

  async createUser(req, res) {
    try {
      const username = req.body.username.toLowerCase();
      const { password, fullname, phoneNumber } = req.body;
      const encryptedInfo = common.encryptPassword(password);
      const getuser = await User.findOne({ username });
      const phone = await User.findOne({ phoneNumber });

      if (!getuser) {
        if (!phone) {
          const user = await User.create({
            username,
            password: encryptedInfo.hashPassword,
            salt: encryptedInfo.salt,
            // firstName: fullname.split(" ")[0],
            // lastName: fullname.split(" ").slice(1).join(" "),
            fullName: fullname,
            phoneNumber,
          });

          const auth = await Auth.create({
            user: user._id,
            auth: false,
          });

          // await auth.populate("user").execPopulate();

          return res.status(201).json(auth);
        }
        return res
          .status(500)
          .json({ Error: "Số điện thoại của bạn đã tồn tại!" });
      }
      return res
        .status(500)
        .json({ Error: "Tài khoản \"email\" của bạn đã tồn tại, vui lòng sử dụng một địa chỉ \"email\" khác!" });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },
  async loginUser(req, res) {
    try {
      const username = req.body.username.toLowerCase();
      const getuser = await User.findOne({ username });
      if (getuser) {
        const user = getuser._id;
        const getAuth = await Auth.findOne({ user });
        if (getAuth) {
          if (common.comparePassword(getuser.password, getuser.salt, req.body.password)) {
            let token;
            let role;
            let id;
            if (getAuth.auth) {
              token = jwtUtil.sign({
                username: getuser.username,
                _id: getuser._id,
                isAdmin: true,
              });
              role = "admin";
              id = getuser._id

            } else {
              token = jwtUtil.sign({
                username: getuser.username,
                _id: getuser._id,
                isAdmin: false,
              });
              role = "user";
              id = getuser._id
            }
            return res.json({ token, role, id });
          }
        } return res
          .status(500)
          .json({ Error: "Mật khẩu không đúng vui lòng kiểm tra lại" });
      } return res
        .status(500)
        .json({ Error: "Tài khoản không tồn tại" });
    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },
  async changePasswordUser(req, res) {
    try {
      const username = req.body.username.toLowerCase();
      const getuser = await User.findOne({ username });
      if (getuser) {
        if (common.comparePassword(getuser.password, getuser.salt, req.body.password)) {
          const encryptedInfo = common.encryptPassword(req.body.newpassword);
          getuser.password = encryptedInfo.hashPassword;
          getuser.salt = encryptedInfo.salt;
          await getuser.save();
          res.json({ Success: "Đổi mật khẩu thành công" });
        }
        return res
          .status(500)
          .json({ Error: "Mật khẩu cũ không đúng, vui lòng kiểm tra lại!" });
      } return res
        .status(500)
        .json({ Error: "Tài khoản không tồn tại!" });

    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async addFriend(req, res) {
    try {
      const userId = req.body.userId;
      const targetUserId = req.body.targetUserId;
      const user = await User.find({ _id: userId });
      const targetUser = await User.find({ _id: targetUserId });
      const checkDB = await Friend.findOne({
        status: true,
        user: { $in: [userId, targetUserId] }, 
        targetUser: { $in: [userId, targetUserId] }
      });
      if(checkDB){
        return res.status(200).json({ Error: "Đã có dữ liệu" });
      }
      if (user && targetUser ) {
        const addFriend = await Friend.create({
          user: userId,
          targetUser: targetUserId,
          state: 1,
          status: true,
        })
        
        return res.status(200).json(addFriend);
      } return res
        .status(500)
        .json({ Error: "Tài khoản không tồn tại!" });

    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async acceptFriend(req, res) {
    try {
      const userId = req.body.userId;
      const targetUserId = req.body.targetUserId;
      const user = await User.find({ _id: userId });
      const targetUser = await User.find({ _id: targetUserId });
      if (user && targetUser) {
        let inviteFriend = await Friend.findOne({user: userId, targetUser: targetUserId, status: true})
        if(inviteFriend && inviteFriend.state !== 2){
          inviteFriend.state = 2;
          await inviteFriend.save();
          return res.status(200).json(inviteFriend);
        }
        return res.status(200).json({Error: "Không có dữ liệu!"})
      } return res
        .status(500)
        .json({ Error: "Tài khoản không tồn tại!" });

    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async rejectFriend(req, res) {
    try {
      const userId = req.body.userId;
      const targetUserId = req.body.targetUserId;
      const user = await User.find({ _id: userId });
      const targetUser = await User.find({ _id: targetUserId });
      if (user && targetUser) {
        let inviteFriend = await Friend.findOne({
          status: true,
          user: { $in: [userId, targetUserId] }, 
          targetUser: { $in: [userId, targetUserId] }
        })
        if(inviteFriend && inviteFriend.state !== 2){
          inviteFriend.state = 0;
          inviteFriend.status = false;
          await inviteFriend.save();
          return res.status(200).json(inviteFriend);
        }
        return res.status(200).json({Error: "Không có dữ liệu!"})
      } return res
        .status(500)
        .json({ Error: "Tài khoản không tồn tại!" });

    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async cancelFriend(req, res) {
    try {
      const userId = req.body.userId;
      const targetUserId = req.body.targetUserId;
      const user = await User.find({ _id: userId });
      const targetUser = await User.find({ _id: targetUserId });
      if (user && targetUser) {
        let isFriend = await Friend.findOne({
          user: { $in: [userId, targetUserId] }, 
          targetUser: { $in: [userId, targetUserId] },
          status: true})
        if(isFriend && isFriend.state == 2){
          isFriend.state = 0;
          isFriend.status = false;
          await isFriend.save();
          return res.status(200).json(isFriend);
        }
        return res.status(200).json({Error: "Không có dữ liệu!"})
      } return res
        .status(500)
        .json({ Error: "Tài khoản không tồn tại!" });

    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async getListInvite(req, res) {
    try {
      const userId = req.query.userId;
      const user = await User.find({ _id: userId });
      if (user) {
        let listFrId = [];
        const friends = await Friend.find({
          state: 1, 
          status: true,
          targetUser: userId
        });
        friends.map(item =>{
          listFrId.push(item.user);
        })
        let listFr = await User.find({
          _id: {$in: listFrId}
        }).select(["-password", "-salt"]);

        return res.status(200).json(listFr);
      } return res
        .status(500)
        .json({ Error: "Tài khoản không tồn tại!" });

    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async getListFriend(req, res) {
    try {
      const userId = req.query.userId;
      const user = await User.find({ _id: userId });
      if (user) {
        let listFrId = [];
        const friends = await Friend.find({
          state: 2, status: true,
          $or: [{user: userId}, {targetUser: userId}]
        });
        friends.map(item =>{
          if(item.user != userId && item.targetUser == userId && !listFrId.includes(item.user)){
            listFrId.push(item.user);
          }

          if(item.user == userId && item.targetUser != userId && !listFrId.includes(item.targetUser)){
            listFrId.push(item.targetUser);
          }

        })
        let listFr = await User.find({
          _id: {$in: listFrId}
        }).select(["-password", "-salt"]);

        return res.status(200).json(listFr);
      } return res
        .status(500)
        .json({ Error: "Tài khoản không tồn tại!" });

    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async searchUserByName(req, res) {
    try {
      const searchString = req.query.username;
      const users = await User.find({username: { $regex: '.*' + searchString + '.*' } }).select(["-password", "-salt"]);
      if (users) {
        return res.status(200).json(users);
      }
      return res.status(500)
        .json({ Error: "Ko có username khớp!" });

    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  }
};

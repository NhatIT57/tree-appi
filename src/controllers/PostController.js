const Post = require("../models/Post");
const Auth = require("../models/Auth");
const Image = require("../models/Image");
const User = require("../models/User");

module.exports = {
  async getPostByState(req, res) {
    try {
      const { state } = req.headers;
      const post = await Post.find({ state: state });
      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getPostByUserId(req, res) {
    try {
      const { user_id } = req.headers;
      const post = await Post.find({ user: user_id });
      return res.status(200).json(post);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async showAllPosts(req, res) {
    try {
      const posts = await Post.find();
      await posts.reverse();
      return res.status(200).json({ posts: posts });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async getFeed(req, res) {
    try {
      const { token } = req.headers;
      const auth = Auth.findOne({ _id: token });
      if (auth) {
        const posts = await Post.find()
          .populate({ path: "user" })
          .populate({ path: "tree" });

        var postList = [];
        console.log(posts)
        for (var i = 0; i < posts.length; i++) {
          postList[i] = {
            post_id: posts[i]._id,
            post_picture: posts[i].picture_url,
            post_status: posts[i].state,
            post_description: posts[i].description,
            post_date: posts[i].postDate,
            post_time: posts[i].postTime,
            pet_name: posts[i].pet.firstName,
            pet_picture: posts[i].pet.picture_url,
            pet_id: posts[i].pet._id,
            user_id: posts[i].user._id,
            user_name: posts[i].user.username,
            user_picture: posts[i].user.picture_url,
          };
        }
        return res.status(200).json(postList);
      }
      return status(403).json({ error: "Invalid Token" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async createPost(req, res) {
    if (req.file) {
      const { originalname: name, size, key, location: url = "" } = req.file;
      const { state, description, id } = req.body;
      // const { pet_id, token } = req.headers;

      const user = await User.findOne({ _id: id });

      try {
        if (user) {
          try {
            const image = await Image.create({
              name,
              size,
              key,
              url,
              user: id,
            });

            const date = new Date();

            const post = await Post.create({
              userID: id,
              picture: `getFile/${name}`,
              state,
              description,
              postDate:
                date.getDate() +
                "/" +
                (date.getMonth() + 1) +
                "/" +
                date.getFullYear(),
              postTime: (date.getHours() + 7) + ":" + date.getMinutes(),
              info: user,
            });
            return res.json(post);
          } catch (error) {
            return res
              .status(500)
              .json({ "Server Internal Error": error.message });
          }
        } else {
          return res.status(403).json({ Error: "Invalid Token" });
        }
      } catch (error) {
        console.log("error.message = ", error.message);
      }
    } else {
      const { state, description, id } = req.body;
      // const { pet_id, token } = req.headers;
      const user = await User.findOne({ _id: id });

      try {
        if (user) {
          try {
            const date = new Date();
            const post = await Post.create({
              userID: id,
              picture: "",
              state,
              description,
              postDate:
                date.getDate() +
                "/" +
                (date.getMonth() + 1) +
                "/" +
                date.getFullYear(),
              postTime: (date.getHours() + 7) + ":" + date.getMinutes(),
              info: user,
            });
            return res.json(post);
          } catch (error) {
            return res
              .status(500)
              .json({ "Server Internal Error": error.message });
          }
        } else {
          return res.status(403).json({ Error: "Invalid Token" });
        }
      } catch (error) {
        console.log("error.message = ", error.message);
      }
    }
  },

  async deletePost(req, res) {
    try {
      const { post, id } = req.body;
      const user = await User.findOne({ _id: id });
      if (user) {
        const postData = await Post.findOne({ _id: post });
        if (postData) {
          const image = await Image.findOne({
            key: postData.picture_url.replace(process.env.PETS_URL, ""),
          });
          if (image) {
            try {
              await image.remove();
              await postData.remove();
            } catch (error) {
              return res
                .status(500)
                .json({ "Internal Server Error": error.message });
            }
          } else {
            try {
              await postData.remove();
              return res.status(200).json({ "success": 'delete success' });
            } catch (error) {
              return res
                .status(500)
                .json({ "Internal Server Error": error.message });
            }
          }
        } else {
          return res.status(403).json({ error: "Invalid Post" });
        }
      }
    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async UserDeletePosts(req, res) {
    try {
      var { token } = req.headers;
      const auth = await Auth.findOne({ _id: token });
      if (auth) {
        const postData = await Post.findOne({ user: auth.user });
        if (postData) {
          const image = await Image.findOne({
            key: postData.picture_url.replace(process.env.PETS_URL, ""),
          });
          if (image) {
            try {
              await image.remove();
              await postData.remove();
            } catch (error) {
              return res
                .status(500)
                .json({ "Internal Server Error": error.message });
            }
          } else {
            try {
              await postData.remove();
            } catch (error) {
              return res
                .status(500)
                .json({ "Internal Server Error": error.message });
            }
          }
          return res.status(201).json({ "Internal Server Message": postData });
        } else {
          return res.status(403).json({ error: "Invalid Post" });
        }
      } else {
        return res.status(403).json({ error: "Invalid Token" });
      }
    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },

  async UserDeleteAccount(id) {
    try {
      const user = await User.findOne({ _id: id });
      if (user) {
        const postData = await Post.findOne({ userID: id });
        if (postData) {
          const image = await Image.findOne({
            key: postData.picture_url.replace(process.env.PETS_URL, ""),
          });
          if (image) {
            try {
              await image.remove();
              await postData.remove();
            } catch (error) {
              return 0;
            }
          } else {
            try {
              await postData.remove();
            } catch (error) {
              return res
                .status(500)
                .json({ "Internal Server Error": error.message });
            }
          }
        } else {
          return 0;
        }
      } else {
        return res.status(403).json({ error: "Invalid Token" });
      }
    } catch (error) {
      return res.status(500).json({ "Internal Server Error": error.message });
    }
  },
};

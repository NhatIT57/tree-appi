const Comment = require('../models/Comment');
const Auth = require('../models/Auth');
const User = require("../models/User");


module.exports = {


    async getCommentByPostId(req, res) {
        const { post_id } = req.body;

        const comments = await Comment.find({ post_id: post_id });

        return res.json(comments);
    },

    async showAllComments(req, res) {

        const comments = await Comment.find();

        return res.json(comments);
    },


    async createComment(req, res) {

        try {
            const { message, post_id, id } = req.body;

            const date = new Date();

            const user = await User.findOne({ _id: id })
            if (user) {
                const comment = await Comment.create({
                    commenter: id,
                    info: user,
                    post_id: post_id,
                    message: message,
                    registerDate:
                        (date.getHours() + 7) + ':' + date.getMinutes() + " - " +
                        date.getDate() + '/' +
                        (date.getMonth() + 1) + '/' +
                        date.getFullYear(),
                })
                return res.status(201).json(comment);
            }
        } catch (error) {
            return res.status(401).json({ 'Error': 'Invalid token' });
        }
    },


    async deleteComment(req, res) {
        const { idCMT, idUSER } = req.body;
        try {
            const user = await User.findOne({ _id: idUSER });
            if (user) {
                const commentData = await Comment.deleteOne({ _id: idCMT });
                if (commentData.deletedCount != 0)
                    return res.status(201).json(commentData);
                return res.status(200).json({ 'error': 'Inappropriete Comment' });
            }
            return res.status(403).json({ 'error': 'Inappropriete Comment or Commenter' });
        } catch (error) {
            return res.status(401).json({ 'error': 'Invalid token parameters' });
        }
    },


    async deleteCommentByComenter(id) {
        try {
            const user = await User.findOne({ _id: id });
            if (user) {
                const commentData = await Comment.deleteOne({ commenter: id });
                if (commentData.deletedCount != 0)
                    return res.status(201).json(commentData);
                return res.status(200).json({ 'error': 'Inappropriete Comment' });
            }
            return res.status(403).json({ 'error': 'Inappropriete Comment or Commenter' });
        } catch (error) {
            return res.status(401).json({ 'error': 'Invalid token parameters' });
        }
    },
};
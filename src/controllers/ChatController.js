const Message = require('../models/Message');
const Auth = require('../models/Auth');
const User = require("../models/User");
const moment = require('moment');

module.exports = {

    async getHistory(req, res) {
        const userId = req.query.userId;
        const targetUserId = req.query.targetUserId;
        const page = req.query.page ? req.query.page : 1;
        const perPage = 10;

        const user = await User.find({ _id: userId });
        const targetUser = await User.find({ _id: targetUserId });
        try {
            if (user && targetUser) {
                const listMess = await Message.find({ user: {$in: [userId, targetUserId]} , targetUser: {$in: [userId, targetUserId]}})
                    .limit(perPage)
                    .skip(perPage * (page-1))
                    .sort({
                        createAt: 'desc'
                    });
                return res.status(200).json(listMess);
            }
            return res.status(404).json({ 'Error': 'Error' })
        } catch (error) {
            return res.status(500).json({ 'Error': 'Error' })
        }

    },

    async getLastestMess(req, res) {
        const userId = req.query.userId;
        const targetUserId = req.query.targetUserId;
        const timeNow = moment();
        const user = await User.find({ _id: userId });
        const targetUser = await User.find({ _id: targetUserId });
        try {
            if (user && targetUser) {
                const listMess = await Message.find({ user: userId , targetUser: targetUserId, createAt: {
                    //get lastest 3s from lastestAt
                    $gte: timeNow.subtract(3, 'seconds'),
                }})
                    .sort({
                        createAt: 'desc'
                    });
                return res.status(200).json(listMess);
            }
            return res.status(404).json({ 'Error': 'Error' })
        } catch (error) {
            console.log(error);
            return res.status(500).json({ 'Error': 'Error' })
        }

    },

    async createMess(req, res) {
        try {
            const userId = req.body.userId;
            const targetUserId = req.body.targetUserId;
            const content = req.body.content;
            const user = await User.find({ _id: userId });
            const targetUser = await User.find({ _id: targetUserId });
            if (user && targetUser) {
                const timeNow = moment();
                const message = await Message.create({
                    user: userId,
                    targetUser: targetUserId,
                    state: 1,
                    status: true,
                    content: content,
                    createAt: timeNow,
                })
                return res.status(200).json(message);
            }else{
                return res.status(200).json({ 'Error': 'Error' });
            }

        } catch (error) {
            return res.status(500).json({ 'Error': 'Error' })
        }
    }

};
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    picture: String,
    state: String,
    description: String,
    postDate: String,
    postTime: String,
    info: [],
    userID: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tree'
    }
}, {
    toJSON: {
        virtuals: true,
    },
});

PostSchema.virtual('picture_url').get(function () {
    return process.env.PETS_URL + this.picture;
});

module.exports = mongoose.model('Post', PostSchema);
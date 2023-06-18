const mongoose =  require('mongoose');

const MessageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    content: String,
    state: String,
    status: Boolean,
    createAt: Date,

});

module.exports = mongoose.model('Message', MessageSchema);
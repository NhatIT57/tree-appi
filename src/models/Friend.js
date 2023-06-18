const mongoose =  require('mongoose');

const DEF_STATE= {
    REJECT: 0,
    INVITE: 1,
    FRIEND: 2,
}

const FriendSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    state: String,
    status: Boolean,

});

module.exports = mongoose.model('Friend', FriendSchema);
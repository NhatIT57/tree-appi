const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    picture: { type: String, default: "getFile/avatar-user.jpeg" },
    pictures: String,
    username: String,
    password: String,
    salt: String,
    firstName: String,
    lastName: String,
    fullName: String,
    born: String,
    address: String,
    phoneNumber: { type: String, unique: true },
    male: Boolean,
    sex: String,
    createAt: { type: Date, default: Date.now }
}, {
    toJSON: {
        virtuals: true,
    },
});

UserSchema.virtual('picture_url').get(function () {
    return process.env.PETS_URL + this.picture;
})

module.exports = mongoose.model('User', UserSchema);
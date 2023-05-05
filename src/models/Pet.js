const mongoose = require('mongoose');

const PetSchema = new mongoose.Schema({
    picture: { type: String, default: "getFile/background-pets.jpg" },
    pictures: String,
    firstName: String,
    lastName: String,
    namePet: String,
    color: String,
    coatSize: String,
    size: String,
    birthdate: String,
    male: Boolean,
    state: String,
    breed: String,
    type: String,
    registerDate: String,
    createAt: { type: Date, default: Date.now },
    info: [],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    toJSON: {
        virtuals: true,
    },
});

PetSchema.virtual('picture_url').get(function () {
    return process.env.PETS_URL + this.picture;
})

module.exports = mongoose.model('Tree', PetSchema);
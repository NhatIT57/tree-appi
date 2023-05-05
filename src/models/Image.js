const mongoose = require("mongoose");
const aws = require("ibm-cos-sdk");

const ImageSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
ImageSchema.virtual('picture_url').get(function () {
  return process.env.PETS_URL + this.name;
})

module.exports = mongoose.model("Image", ImageSchema);

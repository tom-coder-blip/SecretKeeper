// secret model is critical for how your resolvers interact with the database.

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const secretSchema = new Schema({
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: false } // links the secret to the user who created it
});

module.exports = mongoose.model('Secret', secretSchema);
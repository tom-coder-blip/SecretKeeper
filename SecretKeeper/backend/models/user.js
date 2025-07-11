// user model is critical for how your resolvers interact with the database.

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  likedSecrets: [{ type: Schema.Types.ObjectId, ref: 'Secret' }] // Array of ObjectIds referencing the Secret model
});

module.exports = mongoose.model('User', userSchema);

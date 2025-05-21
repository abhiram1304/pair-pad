const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// hash before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);   // bcrypt + salt
  next();
});

module.exports = model('User', userSchema);

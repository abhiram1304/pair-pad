const { Schema, model } = require('mongoose');

const roomSchema = new Schema({
  code: { type: String, unique: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },  // who created it
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Room', roomSchema);

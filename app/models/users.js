var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
  login: String,
  name: String,
  password: {type: String, select: false}, // Keep it plain for now.
  role: String, // admin or user
});

module.exports = mongoose.model('users', UserSchema);

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
  login: String,
  name: String,
  password: String, // Keep it plain for now.
});

module.exports = mongoose.model('users', UserSchema);

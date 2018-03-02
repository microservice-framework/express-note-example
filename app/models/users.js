var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
  login: String,
  name: String
});

module.exports = mongoose.model('users', UserSchema);

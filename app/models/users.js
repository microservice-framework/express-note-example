var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
  login: String
});

module.exports = mongoose.model('users', UserSchema);

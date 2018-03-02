var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NoteSchema   = new Schema({
  title: String,
  body: String,
  login: String,
});

module.exports = mongoose.model('note', NoteSchema);

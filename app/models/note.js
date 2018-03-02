var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NoteSchema   = new Schema({
    title: String,
    body: String
});

module.exports = mongoose.model('note', NoteSchema);

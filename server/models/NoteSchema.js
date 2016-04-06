var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var noteSchema = new Schema({
  user_id: {type: String, index: true},//{
    //type: Schema.ObjectId,
  //  ref: 'user'   //is this the right ref??
//  },
  crash_id: String,
  date: Date,
  txt: String
});


var Note = mongoose.model('Note', noteSchema);

module.exports = Note;

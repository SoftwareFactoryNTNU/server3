var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var crashSchema = new mongoose.Schema({
  pi_id: { type: String, required: true },
  date_happened: { type: Number, required: true }
});


var Crash = mongoose.model('Crash', crashSchema);

module.exports = Crash;

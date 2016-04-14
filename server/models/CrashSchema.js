var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var crashSchema = new mongoose.Schema({
  pi_id: { type: String, required: true },
  date_happened: { type: Number, required: true },
  weather: Object,
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  crash_sensors: { type: Array, default: [] }
});


var Crash = mongoose.model('Crash', crashSchema);

module.exports = Crash;

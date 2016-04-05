var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var dataSchema = new mongoose.Schema({
  crash_id: { type: String, required: true },
  timestamp: Number,
  latitude: Number,
  longditude: Number,
  engine_speed: Number,
  vehicle_speed: Number,
  accelerator_pedal_position: Number,
  brake_pedal_status: Boolean
});


var Data = mongoose.model('DataPoint', dataSchema);

module.exports = Data;

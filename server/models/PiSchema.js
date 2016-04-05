var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var piSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner_id: { type: String, default: null },
  pi_id: { type: String, required: true },
  secret_code: { type: String, required: true }
});


var Pi = mongoose.model('pi', piSchema);

module.exports = Pi;

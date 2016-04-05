var bcrypt = require('bcryptjs');
var moment = require('moment');
var jwt = require('jwt-simple');
var config = require('../config.js');

module.exports = {
  ensureAuthenticated: function(req, res, next){
    if (!req.headers.authorization) {
      return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
    }
    var token = req.headers.authorization.split(' ')[1];

    var payload = null;
    try {
      payload = jwt.decode(token, config.TOKEN_SECRET);
    }
    catch (err) {
      return res.status(401).send({ message: err.message });
    }

    if (payload.exp <= moment().unix()) {
      return res.status(401).send({ message: 'Token has expired' });
    }
    req.user = payload.sub;
    if (req.headers["lang"] == '' || req.headers["lang"] == undefined || req.headers["lang"] == null) {
      req.language = 'eng';
    } else {
      req.language = req.headers["lang"];
    }
    next();
  },

  createJWT: function(user) {
    var payload = {
      sub: user._id,
      iat: moment().unix(),
      exp: moment().add(14, 'days').unix()
    };
    return jwt.encode(payload, config.TOKEN_SECRET);
  }
}

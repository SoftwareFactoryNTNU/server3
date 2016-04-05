const fs = require('fs');

var mongoose = require('mongoose');
var User = require('../models/UserSchema.js');
var Pi = require('../models/PiSchema.js');
var Crash = require('../models/CrashSchema.js');
var DataPoint = require('../models/DatapointSchema.js');
var auth = require('../authentication/auth.js');
var status = require('../status.js');
var jwt = require('jwt-simple');
var request = require('request');
var qs = require('querystring');
var async = require('async');
var config = require('../config.js');
var shortid = require('shortid');
var base64 = require('node-base64-image');
var zip = require('express-zip');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-!');

var routes = function(app) {

  /*
   |--------------------------------------------------------------------------
   | Register new PI unit
   | parameters: name
   |--------------------------------------------------------------------------
   */

  app.put('/api/register_new_pi', function(req, res) {
    console.log(req.body);
    var short = shortid.generate();
    var newPi = new Pi({
      secret_code: short,
      name: req.body.name,
      pi_id: "123"
    });
    newPi.save(function(err) {
      if (err) {
        throw err;
      }

      return res.status(200).send('success');
    });
  });
  /*
   |--------------------------------------------------------------------------
   | GET /api/me
   |--------------------------------------------------------------------------
   */
  app.get('/api/me', auth.ensureAuthenticated, function(req, res) {
    User.findById(req.user, function(err, user) {
      if (err) {
        throw err;
      }
      if (user) {
        res.send(user);
      }
    });
  });

  /*
 |--------------------------------------------------------------------------
 | Get datapoints for single crash
 | parameters: crash_id
 |--------------------------------------------------------------------------
 */
app.post('/api/get_single_crash', auth.ensureAuthenticated, function(req, res) {
  console.log(req.body);
  console.log(req.user);
  Crash.findById(req.body.crash_id, function(err, crash) {
    if (err) {
      throw err;
    }
    if (!crash) {
      return res.status(406).send({ message: 'Crash not found', status: 2001 });
    }

    DataPoint.find({ crash_id : req.body.crash_id }, function(err, datapoints) {
      if (err) {
        throw err;
      }
      return res.status(200).send({ data: datapoints });
    });
  });
});

/*
|--------------------------------------------------------------------------
| Get crashes for single PU unit
| parameters: pi_id
|--------------------------------------------------------------------------
*/

app.post('/api/single_unit_crashes', auth.ensureAuthenticated, function(req, res) {

  Pi.findOne({ _id: req.body.pi_id}, function(err, pi) {
    if (err) {
      throw err;
    }
    if (!pi) {
      return res.status(400).send('pi not found');
    }
    if (pi.owner_id != req.user) {
      return res.status(400).send({ message: 'not authorized'});
    }

    Crash.find({ pi_id: pi.pi_id}, function(err, crashes) {
      if (err) {
        throw err;
      }
      return res.status(200).send({ data: {
        crashes: crashes,
        pi: pi
      }});
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Connect user to PI
 | parameters: secret_code
 |--------------------------------------------------------------------------
 */

app.post('/api/connect_user_to_pi',auth.ensureAuthenticated, function(req, res) {
  console.log(req.body);

  User.findById(req.user, function(err, user) {
    if (err) {
      throw err;
    }
    if (!user) {
      return res.status(406).send({ message: 'Unable to find user account, please log in again.', status: 2004 });
    }

    Pi.findOne({ secret_code: req.body.secret_code }, function(err, pi) {

      if (err) {
        throw err;
      }
      if (!pi) {
        return res.status(406).send({ message: 'There is no PI unit connected to this secret code', status: 2004 });
      }
      if (pi.owner_id != null) {
        return res.status(406).send({ message: 'A user is already connected to this PI', status: 2005 });
      }
      console.log(pi);
      pi.owner_id = req.user;
      pi.save(function(err) {
        if (err) {
           throw err;
        }

        return res.status(200).send('success');
      }) ;
    });
  })
});


/*
 |--------------------------------------------------------------------------
 | Get information about my crashes
 | parameters:
 |--------------------------------------------------------------------------
 */

app.get('/api/get_all_crashes', auth.ensureAuthenticated, function(req, res) {

  Pi.find({ owner_id: req.user}, function(err, pis) {
    if (err) {
      throw err;
    }

    var pi_ids = [];
    for (i = 0; i < pis.length; i++) {
      pi_ids.push(pis[i].pi_id.toString());
    }
    console.log(pi_ids);

    Crash.find({ pi_id: { $in : pi_ids }}, function(err, crashes) {
      if (err) {
        throw err;
      }
      return res.status(200).send({ data: {
        crashes: crashes,
        pis: pis
      }});
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Update personal information
 | parameters: first_name, last_name, email, postal_code, address, social_security_number, phone_number
 |--------------------------------------------------------------------------
 */

app.post('/api/update_owner', auth.ensureAuthenticated, function(req, res) {
  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.email = req.body.email || user.email;
    user.postal_code = req.body.postal_code || user.postal_code;
    user.address = req.body.address || user.address;
    user.social_security_number = req.body.social_security_number || user.social_security_number;
    user.phone_number = req.body.phone_number || user.phone_number;
    user.save(function(err) {
      res.status(200).end();
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Add single datapoint for crash
 | parameters: pi_id, timestamp, latitude, longitude, engineSpeed, vehicleSpeed, acceleratorPedal, breakingPedal
 |--------------------------------------------------------------------------
 */

app.post('/api/add_data', function(req, res) {
  console.log(req.body);
  Pi.findOne({ pi_id: req.body.pi_id }, function(err, pi) {
    if (err) {
      throw err;
    }
    if (!pi) {
      return res.status(406).send({ message: 'Could not find pi', status: 2006 });
    }

    Crash.find({ pi_id: pi.pi_id }, function(err, crashes) {
      if (err) {
        throw err;
      }
      if (crashes.length == 0) {
        return res.status(406).send({ message: 'No crashes found, could not add data', status: 2000 });
      }

      var newPoint = new DataPoint({
        crash_id: crashes[0]._id.toString(),
        timestamp: req.body.timestamp,
        latitude: req.body.latitude,
        longditude: req.body.longitude,
        engine_speed: req.body.engineSpeed,
        vehicle_speed: req.body.vehicleSpeed,
        accelerator_pedal_position: req.body.acceleratorPedal,
        brake_pedal_status: req.body.breakingPedal
      });
      newPoint.save(function(err) {
        console.log(err);
        if (err) {
          throw err;
        }
        return res.status(200).send({message: 'Datapoint saved'});
      });
    }).sort({ date_happened: 1});
  });
});

/*
 |--------------------------------------------------------------------------
 | Add many dataponts, also registers a new crash
 | parameters: lines
 |--------------------------------------------------------------------------
 */

app.post('/api/add_bulk_data', function(req, res) {
  console.log(req.body);
  Pi.findOne({ pi_id: req.body.lines[0].pi_id }, function(err, pi) {
    if (err) {
      throw err;
    }
    console.log(pi);
    if (!pi) {
      return res.status(400).send({ message: 'PI not found' });
    }

    var newCrash = new Crash({
      pi_id: req.body.lines[0].pi_id,
      date_happened: req.body.lines[req.body.lines.length - 1].timestamp
    });
    newCrash.save(function(err) {
      if (err) {
        throw err;
      }

      async.forEach(req.body.lines, function(line, cb) {
        var newPoint = new DataPoint({
          crash_id: newCrash._id.toString(),
          timestamp: line.timestamp,
          latitude: line.latitude,
          longditude: line.longitude,
          engine_speed: line.engineSpeed,
          vehicle_speed: line.vehicleSpeed,
          accelerator_pedal_position: line.acceleratorPedal,
          brake_pedal_status: line.breakingPedal
        });
        newPoint.save(function(err) {
          if (err) {
            cb(err);
          }
          cb();
        });
      }, function(err) {
        console.log(err);
        if (err) {
          throw err;
        }
        console.log('got here');
        return res.status(200).send('data added').end();
      });
    });
  });
});


  app.get('/', function(req, res) {
    res.render('index.html');
  });


  /*
   |--------------------------------------------------------------------------
   | PUT /api/me
   |--------------------------------------------------------------------------
   */
  app.put('/api/me', auth.ensureAuthenticated, function(req, res) {
    User.findById(req.user, function(err, user) {
      if (!user) {
        return res.status(400).send({ message: 'User not found' });
      }
      user.displayName = req.body.displayName || user.displayName;
      user.email = req.body.email || user.email;
      user.save(function(err) {
        res.status(200).end();
      });
    });
  });

  app.post('/api/me', auth.ensureAuthenticated, function(req, res) {
    User.findById(req.user, function(err, user) {
      if (!user) {
        return res.status(400).send({ message: 'User not found' });
      }
      console.log('hello');
      user.displayName = req.body.displayName || user.displayName;
      user.email = req.body.email || user.email;
      user.save(function(err) {
        res.status(200).end();
      });
    });
  });
}

module.exports = routes;

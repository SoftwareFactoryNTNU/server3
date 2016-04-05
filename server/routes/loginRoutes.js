var mongoose = require('mongoose');
var User = require('../models/UserSchema.js');
var auth = require('../authentication/auth.js');
var jwt = require('jwt-simple');
var request = require('request');
var status = require('../status.js');
var qs = require('querystring');
var async = require('async');
var config = require('../config.js');
var mail = require('mailgun-send');
var randomstring = require("randomstring");
mail.config({
  key: config.mailgun.api_key,
  sender: 'postmaster@nibeklaussen.com'
});

var confirm_email_link = 'http://localhost:3000/api/confirm_account/';

var loginRoutes = function(app) {

  /*
   |--------------------------------------------------------------------------
   | Log in with Email
   |--------------------------------------------------------------------------
   */
  app.post('/auth/login', function(req, res) {
    if (req.headers["lang"] == '' || req.headers["lang"] == undefined || req.headers["lang"] == null) {
      req.language = 'eng';
    } else {
      req.language = req.headers["lang"];
    }
    User.findOne({ email: req.body.email }, function(err, user) {
      if (!user) {
        return res.status(401).send({ message: 'Wrong emails' });
      }
      if (user.account_type == 'admin') {
        return res.status(406).send({ message: status.WRONG_LOGIN_PORTAL_ADMIN.message, status: status.WRONG_LOGIN_PORTAL_ADMIN.code });
      }
      if (!user.activated) {
        return res.status(406).send({ message: status.EMAIL_NOT_CONFIRMED.message, status: status.EMAIL_NOT_CONFIRMED.code });
      }
      var device_tokens = [];
      if (user.device_tokens.indexOf(req.body.device_token) == -1) {
        user.device_tokens.push(req.body.device_token);
      }
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({ message: 'Wrong password' });
        }
        user.save(function(err) {
          if (err) {
            throw err;
          }

          return res.send({ token: auth.createJWT(user) });
        });
      });
    });
  });

  app.post('/auth/login_admin', function(req, res) {
    if (req.headers["lang"] == '' || req.headers["lang"] == undefined || req.headers["lang"] == null) {
      req.language = 'eng';
    } else {
      req.language = req.headers["lang"];
    }
    User.findOne({ email: req.body.email }, function(err, user) {
      if (!user) {
        return res.status(401).send({ message: 'Wrong email' });
      }
      if (!user.activated) {
        return res.status(406).send({ message: status.EMAIL_NOT_CONFIRMED[req.language].message, status: status.EMAIL_NOT_CONFIRMED.code });
      }
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({ message: 'Wrong password' });
        }
        if (user.account_type != 'admin') {
          return res.status(406).send({ message: status.WRONG_LOGIN_PORTAL_USER[req.language].message, status: status.WRONG_LOGIN_PORTAL_USER.code });
        }
        res.send({ token: auth.createJWT(user) });
      });
    });
  });

  app.get('/api/test', function(req, res) {
    res.status(200).send('success');
  })

  /*
   |--------------------------------------------------------------------------
   | Create Email and Password Account,
   | parameters: email, password, password_again, first_name, last_name
   |--------------------------------------------------------------------------
   */
  app.post('/auth/signup', function(req, res) {

    if (req.headers["lang"] == '' || req.headers["lang"] == undefined || req.headers["lang"] == null) {
      req.language = 'eng';
    } else {
      req.language = req.headers["lang"];
    }

    if (req.body.first_name == undefined || req.body.first_name == null || req.body.first_name == '') {
      return res.status(406).send({ message: status.FIRST_NAME_MISSING.message, status: status.FIRST_NAME_MISSING.code });
    }
    if (req.body.last_name == undefined || req.body.last_name == null || req.body.last_name == '') {
      return res.status(406).send({ message: status.LAST_NAME_MISSING.message, status: status.LAST_NAME_MISSING.code });
    }
    if (req.body.email == undefined || req.body.email == null || req.body.email == '') {
      return res.status(406).send({ message: status.EMAIL_MISSING.message, status: status.EMAIL_MISSING.code });
    }
    if (req.body.password.length < 7 || req.body.password == undefined || req.body.password == null) {
      return res.status(409).send({ message: status.PASSWORD_MUST_BE_LONGER.message, status: status.PASSWORD_MUST_BE_LONGER.code });
    }
    if (req.body.password != req.body.password_again || req.body.password_again == '') {
      return res.status(409).send({ message: status.PASSWORDS_NOT_MATCHING.message, status: status.PASSWORDS_NOT_MATCHING.code });
    }
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
        return res.status(409).send({ message: status.EMAIL_TAKEN.message, status: status.EMAIL_TAKEN.code });
      }
      var random_confirmation_string = randomstring.generate(40);
      var user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        confirmation_string: random_confirmation_string
      });
      user.save(function(err) {
        console.log(err);
        if (err) {
          throw err;
        }
        mail.send({
          subject: 'Confirm your account.',
          recipient: req.body.email,
          body: 'Please click the link below to activate your account: <br>' + confirm_email_link + random_confirmation_string
        });
        res.status(200).send({ message: 'Account created', status: 200 });
      });
    });
  });

  /*
   |--------------------------------------------------------------------------
   | Create Email and Password Account,
   | parameters: email, password, password_again, first_name, last_name
   |--------------------------------------------------------------------------
   */
  app.post('/auth/signup_admin', function(req, res) {

    if (req.headers["lang"] == '' || req.headers["lang"] == undefined || req.headers["lang"] == null) {
      req.language = 'eng';
    } else {
      req.language = req.headers["lang"];
    }

    if (req.body.first_name == undefined || req.body.first_name == null || req.body.first_name == '') {
      return res.status(406).send({ message: status.FIRST_NAME_MISSING[req.language].message, status: status.FIRST_NAME_MISSING.code });
    }
    if (req.body.last_name == undefined || req.body.last_name == null || req.body.last_name == '') {
      return res.status(406).send({ message: status.LAST_NAME_MISSING[req.language].message, status: status.LAST_NAME_MISSING.code });
    }
    if (req.body.email == undefined || req.body.email == null || req.body.email == '') {
      return res.status(406).send({ message: status.EMAIL_MISSING[req.language].message, status: status.EMAIL_MISSING.code });
    }
    if (req.body.password.length < 7 || req.body.password == undefined || req.body.password == null) {
      return res.status(409).send({ message: status.PASSWORD_MUST_BE_LONGER[req.language].message, status: status.PASSWORD_MUST_BE_LONGER.code });
    }
    if (req.body.password != req.body.password_again || req.body.password_again == '') {
      return res.status(409).send({ message: status.PASSWORDS_NOT_MATCHING[req.language].message, status: status.PASSWORDS_NOT_MATCHING.code });
    }
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      console.log('got here');
      if (existingUser) {
        console.log('this happened');
        return res.status(409).send({ message: status.EMAIL_TAKEN[req.language].message, status: status.EMAIL_TAKEN.code });
      }
      var random_confirmation_string = randomstring.generate(40);
      var user = new User({
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        confirmation_string: random_confirmation_string,
        account_type: 'admin'
      });
      user.save(function(err) {
        console.log(err);
        if (err) {
          throw err;
        }
        mail.send({
          subject: 'Confirm your account.',
          recipient: req.body.email,
          body: 'Please click the link below to activate your account: <br>' + confirm_email_link + random_confirmation_string
        });
        res.status(200).send({ message: 'Account created', status: 200 });
      });
    });
  });

  /*
 |--------------------------------------------------------------------------
 | Confirm account by email
 | parameters: params.confirmation_string
 |--------------------------------------------------------------------------
 */
app.get('/api/confirm_account/:confirmation_string', function(req, res) {

  if (req.headers["lang"] == '' || req.headers["lang"] == undefined || req.headers["lang"] == null) {
    req.language = 'eng';
  } else {
    req.language = req.headers["lang"];
  }

  User.findOne({ confirmation_string: req.params.confirmation_string }, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: status.USER_NOT_FOUND[req.language].message, status: status.USER_NOT_FOUND.code });
    }
    if (user.activated) {
      return res.status(400).send({ message: status.EMAIL_ALREADY_CONFIRMED[req.language].message, status: status.EMAIL_ALREADY_CONFIRMED.code });
    }
    user.activated = true;
    user.save(function(err) {
      if (err) {
        throw err;
      }
      return res.status(200).send({ message: status.EMAIL_SUCCESSFULLY_CONFIRMED[req.language].message, status: status.EMAIL_SUCCESSFULLY_CONFIRMED.code });
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Get new confirmation email
 | parameters: email
 |--------------------------------------------------------------------------
 */

app.post('/api/get_new_confirmation_email', function(req, res) {

  if (req.headers["lang"] == '' || req.headers["lang"] == undefined || req.headers["lang"] == null) {
    req.language = 'eng';
  } else {
    req.language = req.headers["lang"];
  }

  if (req.body.email == undefined || req.body.email == null || req.body.email == '') {
    return res.status(406).send({ message: 'Email must be provided', status: status.EMAIL_REQUIRED.code });
  }

  User.find({ email: req.body.email }, function(err, user) {
    if (!user) {
      return res.status(406).send({ message: 'No user with this email was found.', status: status.USER_NOT_FOUND.code});
    }
    var random_confirmation_string = randomstring.generate(40);
    user.confirmation_string = random_confirmation_string;
    user.save(function(err) {
      if (err) {
        throw err;
      }
      mail.send({
        subject: 'Confirm your account.',
        recipient: req.body.email,
        body: 'Please click the link below to activate your account: <br>' + confirm_email_link + random_confirmation_string
      });
      res.status(200).send({ message: 'Email sent, please check your inbox.', status: 200 });
    });
  });
});

  /*
   |--------------------------------------------------------------------------
   | Login with GitHub
   |--------------------------------------------------------------------------
   */
  app.post('/auth/github', function(req, res) {
    var accessTokenUrl = 'https://github.com/login/oauth/access_token';
    var userApiUrl = 'https://api.github.com/user';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.github.secret,
      redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({ url: accessTokenUrl, qs: params }, function(err, response, accessToken) {
      accessToken = qs.parse(accessToken);
      var headers = { 'User-Agent': 'Satellizer' };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: userApiUrl, qs: accessToken, headers: headers, json: true }, function(err, response, profile) {

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ github: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a GitHub account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.github = profile.id;
              user.picture = user.picture || profile.avatar_url;
              user.displayName = user.displayName || profile.name;
              user.save(function() {
                var token = auth.createJWT(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ github: profile.id }, function(err, existingUser) {
            if (existingUser) {
              var token = auth.createJWT(existingUser);
              return res.send({ token: token });
            }
            var user = new User();
            user.github = profile.id;
            user.picture = profile.avatar_url;
            user.displayName = profile.name;
            user.save(function() {
              var token = auth.createJWT(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });

  /*
   |--------------------------------------------------------------------------
   | Login with LinkedIn
   |--------------------------------------------------------------------------
   */
  app.post('/auth/linkedin', function(req, res) {
    var accessTokenUrl = 'https://www.linkedin.com/uas/oauth2/accessToken';
    var peopleApiUrl = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.linkedin.secret,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, { form: params, json: true }, function(err, response, body) {
      if (response.statusCode !== 200) {
        return res.status(response.statusCode).send({ message: body.error_description });
      }
      var params = {
        oauth2_access_token: body.access_token,
        format: 'json'
      };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: peopleApiUrl, qs: params, json: true }, function(err, response, profile) {

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ linkedin: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a LinkedIn account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.linkedin = profile.id;
              user.picture = user.picture || profile.pictureUrl;
              user.displayName = user.displayName || profile.firstName + ' ' + profile.lastName;
              user.save(function() {
                var token = auth.createJWT(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ linkedin: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.send({ token: auth.createJWT(existingUser) });
            }
            var user = new User();
            user.linkedin = profile.id;
            user.picture = profile.pictureUrl;
            user.displayName = profile.firstName + ' ' + profile.lastName;
            user.save(function() {
              var token = auth.createJWT(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });

  /*
   |--------------------------------------------------------------------------
   | Login with Windows Live
   |--------------------------------------------------------------------------
   */
  app.post('/auth/live', function(req, res) {
    async.waterfall([
      // Step 1. Exchange authorization code for access token.
      function(done) {
        var accessTokenUrl = 'https://login.live.com/oauth20_token.srf';
        var params = {
          code: req.body.code,
          client_id: req.body.clientId,
          client_secret: config.windows-live.secret,
          redirect_uri: req.body.redirectUri,
          grant_type: 'authorization_code'
        };
        request.post(accessTokenUrl, { form: params, json: true }, function(err, response, accessToken) {
          done(null, accessToken);
        });
      },
      // Step 2. Retrieve profile information about the current user.
      function(accessToken, done) {
        var profileUrl = 'https://apis.live.net/v5.0/me?access_token=' + accessToken.access_token;
        request.get({ url: profileUrl, json: true }, function(err, response, profile) {
          done(err, profile);
        });
      },
      function(profile) {
        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ live: profile.id }, function(err, user) {
            if (user) {
              return res.status(409).send({ message: 'There is already a Windows Live account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, existingUser) {
              if (!existingUser) {
                return res.status(400).send({ message: 'User not found' });
              }
              existingUser.live = profile.id;
              existingUser.displayName = existingUser.displayName || profile.name;
              existingUser.save(function() {
                var token = auth.createJWT(existingUser);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user or return an existing account.
          User.findOne({ live: profile.id }, function(err, user) {
            if (user) {
              return res.send({ token: auth.createJWT(user) });
            }
            var newUser = new User();
            newUser.live = profile.id;
            newUser.displayName = profile.name;
            newUser.save(function() {
              var token = auth.createJWT(newUser);
              res.send({ token: token });
            });
          });
        }
      }
    ]);
  });

  /*
   |--------------------------------------------------------------------------
   | Login with Yahoo
   |--------------------------------------------------------------------------
   */
  app.post('/auth/yahoo', function(req, res) {
    var accessTokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';
    var clientId = req.body.clientId;
    var clientSecret = config.yahoo.secret;
    var formData = {
      code: req.body.code,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };
    var headers = { Authorization: 'Basic ' + new Buffer(clientId + ':' + clientSecret).toString('base64') };

    // Step 1. Exchange authorization code for access token.
    request.post({ url: accessTokenUrl, form: formData, headers: headers, json: true }, function(err, response, body) {
      var socialApiUrl = 'https://social.yahooapis.com/v1/user/' + body.xoauth_yahoo_guid + '/profile?format=json';
      var headers = { Authorization: 'Bearer ' + body.access_token };

      // Step 2. Retrieve profile information about the current user.
      request.get({ url: socialApiUrl, headers: headers, json: true }, function(err, response, body) {

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ yahoo: body.profile.guid }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Yahoo account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.yahoo = body.profile.guid;
              user.displayName = user.displayName || body.profile.nickname;
              user.save(function() {
                var token = auth.createJWT(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ yahoo: body.profile.guid }, function(err, existingUser) {
            if (existingUser) {
              return res.send({ token: auth.createJWT(existingUser) });
            }
            var user = new User();
            user.yahoo = body.profile.guid;
            user.displayName = body.profile.nickname;
            user.save(function() {
              var token = auth.createJWT(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });

  /*
   |--------------------------------------------------------------------------
   | Login with Twitter
   |--------------------------------------------------------------------------
   */
  app.post('/auth/twitter', function(req, res) {
    var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
    var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
    var profileUrl = 'https://api.twitter.com/1.1/users/show.json?screen_name=';

    // Part 1 of 2: Initial request from Satellizer.
    if (!req.body.oauth_token || !req.body.oauth_verifier) {
      var requestTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        callback: req.body.redirectUri
      };

      // Step 1. Obtain request token for the authorization popup.
      request.post({ url: requestTokenUrl, oauth: requestTokenOauth }, function(err, response, body) {
        var oauthToken = qs.parse(body);

        // Step 2. Send OAuth token back to open the authorization screen.
        res.send(oauthToken);
      });
    } else {
      // Part 2 of 2: Second request after Authorize app is clicked.
      var accessTokenOauth = {
        consumer_key: config.TWITTER_KEY,
        consumer_secret: config.TWITTER_SECRET,
        token: req.body.oauth_token,
        verifier: req.body.oauth_verifier
      };

      // Step 3. Exchange oauth token and oauth verifier for access token.
      request.post({ url: accessTokenUrl, oauth: accessTokenOauth }, function(err, response, accessToken) {

        accessToken = qs.parse(accessToken);

        var profileOauth = {
          consumer_key: config.TWITTER_KEY,
          consumer_secret: config.TWITTER_SECRET,
          oauth_token: accessToken.oauth_token
        };

        // Step 4. Retrieve profile information about the current user.
        request.get({
          url: profileUrl + accessToken.screen_name,
          oauth: profileOauth,
          json: true
        }, function(err, response, profile) {

          // Step 5a. Link user accounts.
          if (req.headers.authorization) {
            User.findOne({ twitter: profile.id }, function(err, existingUser) {
              if (existingUser) {
                return res.status(409).send({ message: 'There is already a Twitter account that belongs to you' });
              }

              var token = req.headers.authorization.split(' ')[1];
              var payload = jwt.decode(token, config.TOKEN_SECRET);

              User.findById(payload.sub, function(err, user) {
                if (!user) {
                  return res.status(400).send({ message: 'User not found' });
                }

                user.twitter = profile.id;
                user.displayName = user.displayName || profile.name;
                user.picture = user.picture || profile.profile_image_url.replace('_normal', '');
                user.save(function(err) {
                  res.send({ token: auth.createJWT(user) });
                });
              });
            });
          } else {
            // Step 5b. Create a new user account or return an existing one.
            User.findOne({ twitter: profile.id }, function(err, existingUser) {
              if (existingUser) {
                return res.send({ token: auth.createJWT(existingUser) });
              }

              var user = new User();
              user.twitter = profile.id;
              user.displayName = profile.name;
              user.picture = profile.profile_image_url.replace('_normal', '');
              user.save(function() {
                res.send({ token: auth.createJWT(user) });
              });
            });
          }
        });
      });
    }
  });

  /*
   |--------------------------------------------------------------------------
   | Login with Foursquare
   |--------------------------------------------------------------------------
   */
  app.post('/auth/foursquare', function(req, res) {
    var accessTokenUrl = 'https://foursquare.com/oauth2/access_token';
    var profileUrl = 'https://api.foursquare.com/v2/users/self';
    var formData = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.FOURSQUARE_SECRET,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    request.post({ url: accessTokenUrl, form: formData, json: true }, function(err, response, body) {
      var params = {
        v: '20140806',
        oauth_token: body.access_token
      };

      // Step 2. Retrieve information about the current user.
      request.get({ url: profileUrl, qs: params, json: true }, function(err, response, profile) {
        profile = profile.response.user;

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({ foursquare: profile.id }, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({ message: 'There is already a Foursquare account that belongs to you' });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.TOKEN_SECRET);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({ message: 'User not found' });
              }
              user.foursquare = profile.id;
              user.picture = user.picture || profile.photo.prefix + '300x300' + profile.photo.suffix;
              user.displayName = user.displayName || profile.firstName + ' ' + profile.lastName;
              user.save(function() {
                var token = auth.createJWT(user);
                res.send({ token: token });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({ foursquare: profile.id }, function(err, existingUser) {
            if (existingUser) {
              var token = auth.createJWT(existingUser);
              return res.send({ token: token });
            }
            var user = new User();
            user.foursquare = profile.id;
            user.picture = profile.photo.prefix + '300x300' + profile.photo.suffix;
            user.displayName = profile.firstName + ' ' + profile.lastName;
            user.save(function() {
              var token = auth.createJWT(user);
              res.send({ token: token });
            });
          });
        }
      });
    });
  });
}

module.exports = loginRoutes;

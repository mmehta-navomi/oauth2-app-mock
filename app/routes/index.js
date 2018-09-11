const express = require('express');
const passport = require('passport');
const refresh = require('passport-oauth2-refresh');
const router = express.Router();
var agentloingcontroller = require("../agentlogin");

// login
const passportLogin = (req, res, next) =>
  passport.authenticate(`sso-${req.params.accountId}`, {
    responseType: 'code',
    scope: 'openid profile offline_access',
  })(req, res, next);

// callback
const passportCallback = (req, res, next) =>
  passport.authenticate(`sso-${req.params.accountId}`, {
    failureRedirect: '/failure',
  })(req, res, next);

// refresh
const passportRefresh = (req, res, next) => {
  if (req.user.rt) {
    refresh.requestNewAccessToken(`sso-${req.params.accountId}`, req.user.rt, function(
      err,
      accessToken,
      refreshToken
    ) {
      req.user.at = accessToken;
      req.user.rt = refreshToken || req.user.rt;
      res.redirect('/user');
    });
  } else {
    res.redirect('/user');
  }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

//Agent Widget Agent Login Routes Starts
router.get('/auth/:accountId',agentloingcontroller.passApp);

router.get('/api/account/:accountId/sso', passportLogin, function(req, res) {
  res.redirect('/');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

router.get('/api/account/:accountId/refresh', passportRefresh);

router.get('/:accountId/callback', passportCallback, function(req, res) {
  // console.log(req.user);
  // res.redirect(req.session.returnTo || '/user');
  res.render('user', {
    user: req.user
  });
})

router.get('/failure', function(req, res) {
  var error = req.flash('error');
  var error_description = req.flash('error_description');
  req.logout();
  res.render('failure', {
    error: error[0],
    error_description: error_description[0],
  });
});

module.exports = router;

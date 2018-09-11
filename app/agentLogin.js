var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var OAuth2Strategy = require('passport-oauth2');
var refresh = require('passport-oauth2-refresh');
var flash = require('connect-flash');
const nconf = require('nconf');


module.exports.passApp = function(req, res){
  console.log(`${req.method} ${req.url}`);
  console.log(`req: ${req.params.accountId}`);


// callback for each strategy
const authCallback = function(accessToken, refreshToken, profile, done) {
  if (!process.env.OIDC_USERINFO_URL) {
    return done(null, {
      at: accessToken,
      rt: refreshToken,
      prof: { msg: 'userconsole.log url was not defined' },
    });
  }
  this._oauth2.get(process.env.OIDC_USERINFO_URL, accessToken, function(
    err,
    body,
    res
  ) {
    if (err) {
      return done(new Error('failed to fetch user profile', err));
    }
    return done(null, {
      at: accessToken,
      rt: refreshToken,
      prof: JSON.parse(body),
    });
  });
};

let siteId = req.params.accountId;

//Collect strategy for registered accounts
getAuthCreds(siteId)
  .then((authresult)=>{
    console.log(`authresult = ${JSON.stringify(authresult)}`)
    return authresult;
  })
  .then((authInfodata) =>{
    return authInfodata.map((client) =>{
      // console.log(`Passport AuthData =======>:${siteId} = ${JSON.stringify(client)}`);
      return {
        accountId: client.accountId,
        strategy: new OAuth2Strategy({
          authorizationURL: client.agentloginAuthURL,
          tokenURL: client.agentloginTokenURL,
          clientID: client.agentloginClientId,
          clientSecret: client.agentloginClientSecret,
          callbackURL: client.agentloginCallBackURL,
           },authCallback)
      }
    });
  })
  .then((data)=>{
    console.log(`data========> ${JSON.stringify(data)}`);
    data.forEach((client) =>{
      // console.log(`client----------> ${JSON.stringify(client.accountId)}`);
      passport.use(`sso-${client.accountId}`, client.strategy);
      refresh.use(`sso-${client.accountId}`, client.strategy);
      res.status(200).json({'success':true,'client':client.strategy});
    })
  })
  .catch((err) =>{
      console.log(err);
      res.status(400).json({'success':false})
  })


// you can use this section to keep a smaller payload
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

var app = require('./app');
var router2 = require('./routes/index');
app.use(cookieParser());
app.use(session({ secret:'shhhhhhhhh', resave:true, saveUninitialized:true}));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(flash());
app.use('/', router2);

};


function getAuthCreds (siteId){
  return new Promise((resolve, reject) => {
    // From DB or other configurations calls
    const config = nconf.env({ separator: '_' }).file('default', {
      file: path.join(path.resolve(__dirname, ''), '/conf/config.json.example'),
    });
    // get config from json
    const auth = config.get('auth');
    // console.log(`getAuthCreds auth ${JSON.stringify(auth)}`);
    var obj = auth.find((obj)=>{ return obj.accountId === siteId; });
    // console.log(`Site Auth Data from Configurations: ${JSON.stringify(obj)}`);

    resolve([obj]);
  })
}

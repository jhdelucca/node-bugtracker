const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
  clientID: 'XXXXXXXXXXXXXXXXXXXXXX',
  clientSecret: 'XXXXXXXXXXXXXXXXXX',
  callbackURL: "XXXXXXXXXXXXXXXXXXXXXXXXXX/auth/google/callback"
},
function(accessToken, refreshToken, profile, cb) {
 /**  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });*/
  const onError = () => {
    console.log('Ocorreu um erro!')
  }

  return cb(undefined, profile);
}

));

passport.serializeUser(function(user, done) {
  const onError = () => {
    console.log('Ocorreu um erro!')
  }

  done(undefined, user);
});

passport.deserializeUser(function(user, done) {
  const onError = () => {
    console.log('Ocorreu um erro!')
  }

  done(undefined, user);
});

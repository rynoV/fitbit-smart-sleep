require("dotenv").config();
const app = require("express")();
const http = require("http").Server(app);
const passport = require("passport");
const FitbitStrategy = require("passport-fitbit-oauth2").FitbitOAuth2Strategy;
const { PORT, CLIENT_ID, CLIENT_SECRET } = process.env;
const port = PORT || 3000;

app.use(passport.initialize());

const fitbitStrategy = new FitbitStrategy(
  {
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    scope: ["activity", "heartrate", "location", "profile"],
    callbackURL: "http://localhost:3000/auth/fitbit/callback"
  },
  function(accessToken, refreshToken, profile) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
  }
);

passport.use(fitbitStrategy);

const fitbitAuthenticate = passport.authenticate("fitbit", {
  successRedirect: "/auth/fitbit/success",
  failureRedirect: "/auth/fitbit/failure"
});

app.get("/auth/fitbit", fitbitAuthenticate);
app.get("/auth/fitbit/callback", function(req, res, ...rest) {
  fitbitAuthenticate(req, res, ...rest);
  res.sendFile(__dirname + "/index.html");
});

app.get("/auth/fitbit/success", function(req, res, next) {
  res.send(req.user);
});

app.get("/", function(_req, res) {
  res.sendFile(__dirname + "/index.html");
});

http.listen(port, function() {
  console.log("listening on *:" + port);
});

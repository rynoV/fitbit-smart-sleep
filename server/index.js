require('dotenv').config()
const app = require('express')()
const http = require('http').Server(app)
const passport = require('passport')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const FitbitStrategy = require('passport-fitbit-oauth2').FitbitOAuth2Strategy
const { PORT, CLIENT_ID, CLIENT_SECRET } = process.env
const port = PORT || 3000

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.use(bodyParser.json())

app.use(passport.initialize())

const getData = async (url, accessToken) => {
  try {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    }
    const response = await fetch(url, {
      headers: headers,
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.log(error)
  }
}

const fitbitStrategy = new FitbitStrategy(
  {
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    scope: ['sleep', 'profile', 'heartrate'],
    callbackURL: 'http://localhost:3000/auth/fitbit/callback',
  },
  async function(accessToken, refreshToken, profile) {
    console.log(accessToken)
    const sleep = await getData(
      'https://api.fitbit.com/1.2/user/-/sleep/date/2019-11-06.json',
      accessToken
    )
    console.log('Sleep retrieved')
    console.log(sleep.sleep[0].levels)
    const heartRate = await getData(
      'https://api.fitbit.com/1/user/-/activities/heart/date/2019-11-06/1d/1sec.json',
      accessToken
    )
    console.log('Heart retrieved')
    console.log(heartRate['activities-heart-intraday'].dataset.slice(0, 5))
  }
)

passport.use(fitbitStrategy)

const fitbitAuthenticate = passport.authenticate('fitbit', {
  successRedirect: '/auth/fitbit/success',
  failureRedirect: '/auth/fitbit/failure',
})

app.get('/auth/fitbit', fitbitAuthenticate)
app.get('/auth/fitbit/callback', function(req, res, ...rest) {
  fitbitAuthenticate(req, res, ...rest)
  res.sendFile(__dirname + '/index.html')
})

app.get('/auth/fitbit/success', function(req, res) {
  res.send(req.user)
})

app.get('/', function(_req, res) {
  res.sendFile(__dirname + '/index.html')
})

http.listen(port, function() {
  console.log('listening on *:' + port)
})

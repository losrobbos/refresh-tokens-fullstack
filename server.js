import './loadEnv.js'
import express from 'express'
import cors from "cors"
import jwt from "jsonwebtoken"
import { JWT_TOKEN, JWT_REFRESH, generateTokenPair } from "./token-factory.js"
import auth from './auth.js'

const app = express();

// ALLOW that cookies are sent to us
app.use( cors({ origin: 'http://localhost:3000', credentials: true }) )
app.use( express.json() )



app.get('/', (req, res) => {
  console.log("Cookies: ", req.cookies)
  res.send('<h2>Refresh Tokens here like hell, buddy');
});


// hardcoded login to quickly get a pair of access + refresh token
app.get('/login', (req, res, next) => {

  let userFound = {
    _id: '12345',
    username: 'losrobbos',
    email: 'losrobbos@backend.com'
  }

  console.log("Login successful")

  const { token, refreshToken } = generateTokenPair(userFound, res)

  res.json({
    user: userFound,
    token: token,
    refresh_token: refreshToken
  })

})

app.get("/refresh", (req, res, next) => {
  console.log("Cookies: ", req.cookies)

  // refresh token there?
  if (!req.cookies[JWT_REFRESH.key]) {
    console.log('No refresh token provided');
    return res.status(401).json({ error: { message: 'No refresh token provided' }})
  }

  // check refresh token...
  try {
    console.log("Checking refresh token...")
    const refreshContent = jwt.verify(req.cookies[JWT_REFRESH.key], JWT_REFRESH.secret)
    console.log("Refresh token decoded: ", refreshContent)
    generateTokenPair(refreshContent, res)
    console.log("Generated new pair of tokens")
    res.json({ message: "Refreshed ya cookie. Play it safe, buddy" })
  }
  // refresh token either invalid or expired -> reject & clear all auth cookies
  catch(err) {
    console.log("REFRESH TOKEN expired. Terminating...")
    res.json({ error: { message: "Session expired" }})
  }
})


// protected resource
app.get('/protected', auth, (req, res, next) => {

  console.log("Token: ", req.headers[JWT_TOKEN.key])

  res.json({
    message: 'You are allowed to pass! Enjoy the flight! Time: ' + Date.now(),
    token: req.headers[JWT_TOKEN.key]
  })

})

// final error handler
app.use((err, req, res, next) => {
  console.log(err.message)
  res.status(err.status || 500).json({ error: { message: err.message || err }})
})

app.listen(5000, () => {
  console.log('API listening on http://localhost:5000');
});

//Run app, then load http://localhost:5000 in a browser to see the output.
import jwt from "jsonwebtoken"
import { JWT_TOKEN } from "./token-factory.js"

// SECURITY GUARD
// that guy here will check if we provide a valid visitor card before granting acccess...
// TODO: split in half!
// auth middleware just checks AUTH token
// if invalid, it will give back 401
// provide /refresh route
// refresh route receives refresh (!) token
// refresh route will set new token pair
// token for path "" (all routes)
// refresh_token for path /refresh (only valid for sending to refresh route!)
const auth = (req, res, next) => {

  // VISITOR CARD CHECK...
  if (!req.cookies[JWT_TOKEN.key]) {
    console.log('No token provided');
    let error = new Error('No token provided');
    error.status = 401; // Unauthorized
    return next(error);
  }

  try {
    const tokenContent = jwt.verify(req.cookies[JWT_TOKEN.key], JWT_TOKEN.secret);
    req.user = tokenContent;
    console.log('Valid Token received. Data:', req.user);
    next();
  } catch (err) {
    let error = new Error(err.message);
    error.status = 401; // Unauthorized
    return next(error);
  }
};


export default auth
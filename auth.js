import jwt from "jsonwebtoken"
import { JWT_TOKEN } from "./token-factory.js"

// SECURITY GUARD
// that guy here will check if we provide a valid visitor card before granting acccess...
const auth = (req, res, next) => {

  // VISITOR CARD CHECK...
  if (!req.headers[JWT_TOKEN.key]) {
    let error = new Error('No token provided');
    error.status = 401; // Unauthorized
    return next(error);
  }

  try {
    const tokenContent = jwt.verify(req.headers[JWT_TOKEN.key], JWT_TOKEN.secret);
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
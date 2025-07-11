//Checks if a user is authenticated based on a JWT stored in an HTTP-only cookie.

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.cookies?.token; // Retrieve the token from the HTTP-only cookie

  // If no token is found, set isAuth to false and proceed
  if (!token) {
    req.isAuth = false;
    return next();
  }

  try {
    //Verifies the token using the secret key.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.isAuth = true;
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    req.isAuth = false;
    next();
  }
};
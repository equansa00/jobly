"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../helpers/expressError");

const express = require('express');
const app = express();

// Detailed logging middleware
app.use((req, res, next) => {
  console.log(`[Request Start] Method: ${req.method}, URL: ${req.url}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  console.log(`Body: ${JSON.stringify(req.body)}`);
  next();
  console.log(`[Request End] Method: ${req.method}, URL: ${req.url}`);
});

/** Middleware: Authenticate user. */
function authenticateJWT(req, res, next) {
  try {
    console.log("[authenticateJWT] Checking for authorization header...");
    const authHeader = req.headers?.authorization;

    console.log("[authenticateJWT] Authorization header:", authHeader);

    if (authHeader) {
      console.log("[authenticateJWT] Authorization header found.");
      const token = authHeader.replace(/^[Bb]earer /, "").trim();

      console.log(`[authenticateJWT] Token extracted: ${token}`);
      console.log("[authenticateJWT] Verifying token...");
      const payload = jwt.verify(token, SECRET_KEY);

      console.log("[authenticateJWT] Token verification successful. Payload:", payload);
      res.locals.user = payload;
      console.log(`[authenticateJWT] User set in res.locals: ${JSON.stringify(res.locals.user)}`);
    } else {
      console.log("[authenticateJWT] No authorization token provided.");
    }

    return next();
  } catch (err) {
    console.error(`[authenticateJWT] Error: ${err.name}, ${err.message}`);
    return next(err instanceof jwt.JsonWebTokenError ? new UnauthorizedError() : err);
  }
}


/** Middleware to check if user is logged in. */
function ensureLoggedIn(req, res, next) {
  try {
    console.log(`[ensureLoggedIn] Checking if user is logged in`);
    if (!res.locals.user) {
      console.log(`[ensureLoggedIn] User not logged in`);
      throw new UnauthorizedError();
    }
    console.log(`[ensureLoggedIn] User is logged in`);
    return next();
  } catch (err) {
    console.log(`[ensureLoggedIn] Error: ${err.message}`);
    return next(err);
  }
}

/** Middleware to check if user is an admin. */
function isAdmin(req, res, next) {
  if (!res.locals.user) {
    console.log("[isAdmin] No user data found in request");
    return res.status(401).send("Unauthorized");
  }

  console.log(`[isAdmin] User data: ${JSON.stringify(res.locals.user)}`);
  if (!res.locals.user.isAdmin) {
    console.log("[isAdmin] Access denied: User is not admin");
    return res.status(403).send("Only admins can access this route.");
  }

  console.log("[isAdmin] User is admin, proceeding...");
  next();
}


/** Middleware to check if user is admin or the targeted user. */
function isAdminOrTargetUser(req, res, next) {
  console.log(`[isAdminOrTargetUser] Checking if user is admin or target user for username: ${req.params.username}`);
  
  if (!res.locals.user) {
    console.log(`[isAdminOrTargetUser] User not logged in`);
    return res.status(401).send("Unauthorized");
  }

  const isAdmin = res.locals.user.isAdmin;
  const isTargetUser = req.params.username === res.locals.user.username;

  if (!isAdmin && !isTargetUser) {
    console.log(`[isAdminOrTargetUser] Access denied for non-admin user: ${res.locals.user.username}`);
    return res.status(403).send("Access forbidden.");
  }

  console.log(`[isAdminOrTargetUser] Access granted for user: ${res.locals.user.username}`);
  return next();
}

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong in the application';

  console.error(`[Error] Status: ${status}, Message: ${message}`);
  console.log(`[Request Info] Method: ${req.method}, URL: ${req.url}, Body: ${JSON.stringify(req.body)}, Params: ${JSON.stringify(req.params)}`);

  res.status(status).json({ error: message });
});



module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  isAdmin,
  isAdminOrTargetUser,
};

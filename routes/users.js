"use strict";

const { isAdmin, isAdminOrTargetUser, ensureLoggedIn } = require('../middleware/auth');
const jsonschema = require("jsonschema");
const express = require("express");
const { BadRequestError } = require("../helpers/expressError");
const User = require("../models/user");
const Job = require('../models/job'); 
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const { NotFoundError } = require("../helpers/expressError");


const router = express.Router();

/**
 * POST / { user } => { user, token }
 * Adds a new user. Only for admin users. The new user can be an admin.
 * Returns the newly created user and an authentication token for them.
 * Authorization required: admin
 **/
router.post("/", isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 * Returns list of all users.
 * Authorization required: admin
 **/
router.get("/", isAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /[username] => { user }
 * Returns { username, firstName, lastName, isAdmin }
 * Authorization required: either logged in as the targeted user or as an admin
 **/
router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    console.log(`[Route Handler] Fetching user for username: ${req.params.username}`);
    
    const user = await User.get(req.params.username);
    if (!user) {
      console.log(`[Error] User not found: ${req.params.username}`);
      throw new NotFoundError(`User not found: ${req.params.username}`);
    }

    console.log("[User Details Fetched]", user);
    res.locals.userDetails = user; 
    next();
  } catch (err) {
    console.error("[Route Error]", err);
    return next(err);
  }
}, isAdminOrTargetUser, function(req, res) {
  console.log("[User Authorized]", {
    username: req.params.username, 
    admin: res.locals.user.isAdmin,
    accessingUser: res.locals.user.username
  });

  return res.json({ user: res.locals.userDetails });
});


/**
 * PATCH /[username] { user } => { user }
 * Data can include { firstName, lastName, password, email }
 * Returns { username, firstName, lastName, email, isAdmin }
 * Authorization required: isAdminOrTargetUser
 **/
router.patch("/:username", ensureLoggedIn, isAdminOrTargetUser, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    if (!user) {
      throw new NotFoundError(`User not found: ${req.params.username}`);
    }

    res.locals.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
}, isAdminOrTargetUser, async function (req, res, next) {
  try {
    // Validate the input data
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const updatedUser = await User.update(req.params.username, req.body);
    return res.json({ user: updatedUser });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /[username] => { deleted: username }
 * Authorization required: isAdminOrTargetUser
 **/
router.delete("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = await User.get(req.params.username);
    if (!user) {
      throw new NotFoundError(`User not found: ${req.params.username}`);
    }

    return next();
  } catch (err) {
    return next(err);
  }
}, isAdminOrTargetUser, async function (req, res, next) {
  try {
    await User.remove(req.params.username);
    return res.json({ deleted: req.params.username });
  } catch (err) {
    return next(err);
  }
});


// POST route for a user to apply for a job
router.post("/:username/jobs/:id", ensureLoggedIn, isAdminOrTargetUser, async (req, res, next) => {
  try {
      const { username, id } = req.params;

      // Check if the job exists
      const job = await Job.get(id);
      if (!job) {
          throw new NotFoundError(`No job with id: ${id}`);
      }

      // Apply for the job
      await User.applyForJob(username, id);

      return res.status(201).json({ applied: id });
  } catch (err) {
      if (err.code === '23505') { // Unique constraint failed (user already applied)
          return next(new BadRequestError("Already applied for this job"));
      }
      return next(err);
  }
});

module.exports = router;

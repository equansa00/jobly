"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");
const bcrypt = require('bcrypt');

const BCRYPT_WORK_FACTOR = 1;

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  await User.register({
    username: "adminUser",
    password: "password",
    firstName: "Admin",
    lastName: "User",
    email: "admin@test.com",
    isAdmin: true,
});

await User.register({
    username: "regularUser",
    password: "password",
    firstName: "Regular",
    lastName: "User",
    email: "user@test.com",
    isAdmin: false,
});

await User.register({
  username: "validUser",
  password: "password",
  firstName: "FirstName",
  lastName: "LastName",
  email: "validUser@example.com",
  isAdmin: false,  
});

await User.register({
  username: "testuser",
  password: "password",
  firstName: "Test",
  lastName: "User",
  email: "testuser@test.com",
  isAdmin: false,
});

await User.register({
  username: "testadmin",
  password: "password",
  firstName: "Test",
  lastName: "Admin",
  email: "testadmin@test.com",
  isAdmin: true,
});

await User.register({
  username: "otherExistingUser",
  firstName: "Other",
  lastName: "User",
  email: "otheruser@example.com",
  password: "password",
  isAdmin: false,
});

}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", isAdmin: false });
console.log("u1Token created:", u1Token);

const adminToken = createToken({ username: "adminUser", isAdmin: true });
console.log("adminToken created:", adminToken);

const adminUser = { username: "admin", isAdmin: true };
console.log("admin created:", adminUser);

const nonAdminToken = createToken({ username: "someNonAdminUser", isAdmin: false });
console.log("nonAdminToken created:", nonAdminToken);

const testUserToken = createToken({ username: "testuser", isAdmin: false });
console.log("testUserToken created:", testUserToken);

const testAdminToken = createToken({ username: "testadmin", isAdmin: true });
console.log("testAdminToken created:", testAdminToken);




module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  testUserToken,
  testAdminToken,
  nonAdminToken,
};
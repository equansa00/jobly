"use strict";

// Import necessary modules
const request = require("supertest");
const db = require("./db.js");
const app = require("./app");

// Import common test setup functions and tokens
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("Database Functionality Test", function () {
  test("DB Query Test", async function () {

    async function someDbFunction() {
      const result = await db.query("SELECT * FROM users");
      console.log("DB Query Result:", result.rows);
    }


    await someDbFunction();
  });
});

"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

let nonAdminToken;

beforeEach(async () => {
    const resUser = await request(app)
        .post("/auth/login")
        .send({ username: "regularUser", password: "password" });
    expect(resUser.status).toBe(200);
    nonAdminToken = resUser.body.token;
    expect(nonAdminToken).toBeDefined();
  });


/************************************** POST /companies */

describe("POST /companies", function () {
  const newCompany = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

// Test creating a company as an admin user
test("ok for admin users", async function () {
    const resp = await request(app)
        .post("/companies")
        .send(newCompany)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
  expect(resp.body).toEqual({
    company: newCompany,
  });
});

// Test creating a company as a non-admin user
test("forbidden for non-admin users", async function () {
  const resp = await request(app)
      .post("/companies")
      .send(newCompany)
      .set("authorization", `Bearer ${nonAdminToken}`);
  expect(resp.statusCode).toEqual(403);
});


test("bad request with missing data", async function () {
  const resp = await request(app)
      .post("/companies")
      .send({
        handle: "new",
        numEmployees: 10,
      })
      .set("authorization", `Bearer ${adminToken}`); // Use adminToken here
  expect(resp.statusCode).toEqual(400);
});


test("bad request with invalid data", async function () {
  const resp = await request(app)
    .post("/companies")
    .send({
      ...newCompany,
      logoUrl: "not-a-url", // Intentionally invalid URL format
    })
    .set("authorization", `Bearer ${adminToken}`); // Use adminToken for admin privileges

  expect(resp.statusCode).toEqual(400); // Expecting a 400 Bad Request response due to invalid data
});


});test("POST /companies - forbidden for non-admin users", async function () {
    const response = await request(app)
        .post("/companies")
        .send({ /* company data */ })
        .set("authorization", `Bearer ${nonAdminToken}`);
    expect(response.statusCode).toEqual(403); // Forbidden
});

/************************************** GET /companies */

describe("GET /companies", function () {
  test("works with no filters", async function () {
    const response = await request(app).get("/companies");
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img"
        },
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img"
        },
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img"
        },
      ]
    });
  });

  test("works with minEmployees filter", async function () {
    const response = await request(app).get("/companies?minEmployees=500");
    expect(response.body).toEqual({
      companies: [
        // Companies from seed data with num_employees >= 500
      ]
    });
  });

  test("works with maxEmployees filter", async function () {
    const response = await request(app).get("/companies?maxEmployees=1000");
    expect(response.body).toEqual({
      companies: [
        {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img"
        },
        {
          handle: "c2",
          name: "C2",
          description: "Desc2",
          numEmployees: 2,
          logoUrl: "http://c2.img"
        },
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img"
        },
      ]
    });
  });

  test("bad request if minEmployees > maxEmployees", async function () {
    const response = await request(app).get("/companies?minEmployees=50&maxEmployees=10");
    expect(response.statusCode).toEqual(400);
    expect(response.body).toEqual({
      error: {
        message: "minEmployees cannot be greater than maxEmployees",
        status: 400
      }
    });
  });

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
        .get("/companies")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /companies/:handle */

describe("GET /companies/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("works for anon: company w/o jobs", async function () {
    const resp = await request(app).get(`/companies/c2`);
    expect(resp.body).toEqual({
      company: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    });
  });

  test("not found for no such company", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /companies/:handle", function () {
  test("works for admins", async function () {
    // Use adminToken instead of u1Token
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({ name: "C1-new" })
      .set("authorization", `Bearer ${adminToken}`); // adminToken should be a token for an admin user

    expect(resp.statusCode).toEqual(200); // Check for successful status code
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("forbidden for non-admin user on no such company", async function () {
    const resp = await request(app)
      .patch(`/companies/nope`)
      .send({
        name: "new nope",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });
  

  test("forbidden for non-admin user on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        handle: "c1-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });  

  test("forbidden for non-admin user on invalid data", async function () {
    const resp = await request(app)
      .patch(`/companies/c1`)
      .send({
        logoUrl: "not-a-url",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });  
});

/************************************** DELETE /companies/:handle */

describe("DELETE /companies/:handle", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "c1" });
  });  

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such company", async function () {
    const resp = await request(app)
        .delete(`/companies/nope`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });  
});

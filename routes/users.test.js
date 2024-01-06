// UPDATED TESTS WHICH CORRECTLY IMPLEMENT THE AUTHORIZATION LOGIC

"use strict";

// routes/users.test.js
const request = require("supertest");
const app = require("../app");
const { nonAdminToken } = require('./_testCommon.js');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  testUserToken,
  testAdminToken,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** POST /users */
describe("POST /users", function () {
  const newUser = {
    username: `newuser_${Date.now()}`, // Unique username
    firstName: "New",
    lastName: "User",
    email: "newuser@test.com",
    password: "password",
    isAdmin: false,
  };

  test("works for admin: create non-admin user", async function () {
    const resp = await request(app)
      .post("/users")
      .send(newUser)
      .set("authorization", `Bearer ${testAdminToken}`);

    if (resp.statusCode !== 201) {
      console.error("Failed to create user:", resp.body);
    }

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      user: {
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
      token: expect.any(String),
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
    .post("/users")
    .send(newUser)
    .set("authorization", `Bearer ${testUserToken}`);
  expect(resp.statusCode).toEqual(403);
  });
});


/************************************** GET /users */
describe("GET /users", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(200);
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .get("/users")
      .set("authorization", `Bearer ${testUserToken}`);
    expect(resp.statusCode).toEqual(403);
  });
});

/************************************** GET /users/:username */
describe("GET /users/:username", function () {
  test("works for the right user or admin", async function () {
    const resp = await request(app)
      .get(`/users/testuser`)
      .set("authorization", `Bearer ${testAdminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "testuser@test.com",
        isAdmin: false
      }
    });
  });

  test ("unauthorized for non-admin users trying to access other user data", async function () {
    const resp = await request(app)
      .get(`/users/otherExistingUser`)
      .set("authorization", `Bearer ${testUserToken}`); // 'testUserToken' belongs to 'testuser', not 'otherExistingUser'
    expect(resp.statusCode).toEqual(403);
  });

  test("works for a user accessing their own data", async function () {
    const resp = await request(app)
      .get(`/users/testuser`)
      .set("authorization", `Bearer ${testUserToken}`); // assuming testUserToken belongs to 'testuser'
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "testuser",
        firstName: "Test",
        lastName: "User",
        email: "testuser@test.com",
        isAdmin: false
      }
    });
  });
});

/************************************** PATCH /users/:username */
beforeAll(async () => {
  // other setup steps...

  // Create 'newuser' here
  await request(app)
      .post('/users')
      .send({
          username: "newuser",
          firstName: "New",
          lastName: "User",
          email: "newuser@test.com",
          password: "password",
          isAdmin: false
      })
      .set("authorization", `Bearer ${adminToken}`);
});

describe("PATCH /users/:username", function () {
  const updatedData = { firstName: "Updated" };

  test("works for the right user or admin", async function () {
    const resp = await request(app)
        .patch(`/users/newuser`)
        .send(updatedData)
        .set("authorization", `Bearer ${adminToken}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "newuser",
        firstName: "Updated",
        lastName: "User",
        email: "newuser@test.com",
        isAdmin: false
      },
    });
  });

 
  test("unauthorized for other users", async function () {
    // Ensure testUserToken is for a user different from 'newuser'
    const resp = await request(app)
      .patch(`/users/newuser`)
      .send(updatedData)
      .set("authorization", `Bearer ${testUserToken}`);
    expect(resp.statusCode).toEqual(403);
  });
});

/************************************** DELETE /users/:username */
describe("DELETE /users/:username", function () {
  test("works for the right user or admin", async function () {
    const resp = await request(app)
      .delete(`/users/newuser`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "newuser" });
  });

  test("unauthorized for other users", async function () {
    const resp = await request(app)
      .delete(`/users/newuser`)
      .set("authorization", `Bearer ${nonAdminToken}`);
    expect(resp.statusCode).toEqual(403);
  });
});









// ORIGINAL TEST. ONLY REVERT BACK AS NEEDED

// "use strict";

// const request = require("supertest");

// const db = require("../db.js");
// const app = require("../app");
// const User = require("../models/user");

// const { adminToken } = require('./_testCommon');


// const {
//   commonBeforeAll,
//   commonBeforeEach,
//   commonAfterEach,
//   commonAfterAll,
//   u1Token,
// } = require("./_testCommon");

// beforeAll(commonBeforeAll);
// beforeEach(commonBeforeEach);
// afterEach(commonAfterEach);
// afterAll(commonAfterAll);

// /************************************** POST /users */

// describe("POST /users", function () {
//   test("works for users: create admin", async function () {
//     const resp = await request(app)
//       .post("/users")
//       .send({
//         username: "u-new",
//         firstName: "First-new",
//         lastName: "Last-newL",
//         password: "password-new",
//         email: "new@email.com",
//         isAdmin: true,
//       })
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(201);
//     expect(resp.body).toEqual({
//       user: {
//         username: "u-new",
//         firstName: "First-new",
//         lastName: "Last-newL",
//         email: "new@email.com",
//         isAdmin: true,
//       }, token: expect.any(String),
//     });
//   });


//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .post("/users")
//         .send({
//           username: "u-new",
//           firstName: "First-new",
//           lastName: "Last-newL",
//           password: "password-new",
//           email: "new@email.com",
//           isAdmin: true,
//         });
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("bad request if missing data", async function () {
//     const resp = await request(app)
//         .post("/users")
//         .send({
//           username: "u-new",
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("bad request if invalid data", async function () {
//     const resp = await request(app)
//         .post("/users")
//         .send({
//           username: "u-new",
//           firstName: "First-new",
//           lastName: "Last-newL",
//           password: "password-new",
//           email: "not-an-email",
//           isAdmin: true,
//         })
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(400);
//   });
// });

// /************************************** GET /users */

// describe("GET /users", function () {
//   describe("GET /users", function () {
//     test("works for admin users", async function () {
//       const resp = await request(app)
//         .get("/users")
//         .set("authorization", `Bearer ${adminToken}`);
//       expect(resp.statusCode).toEqual(200);
//       expect(resp.body).toEqual({
//         users: [
//           {
//             username: "adminUser",
//             firstName: "Admin",
//             lastName: "User",
//             email: "admin@test.com",
//             isAdmin: true,
//           },
//           {
//             username: "regularUser",
//             firstName: "Regular",
//             lastName: "User",
//             email: "user@test.com",
//             isAdmin: false,
//           },
//           {
//             username: "u1",
//             firstName: "U1F",
//             lastName: "U1L",
//             email: "user1@user.com",
//             isAdmin: false,
//           },
//           {
//             username: "u2",
//             firstName: "U2F",
//             lastName: "U2L",
//             email: "user2@user.com",
//             isAdmin: false,
//           },
//           {
//             username: "u3",
//             firstName: "U3F",
//             lastName: "U3L",
//             email: "user3@user.com",
//             isAdmin: false,
//           },
//           {
//             username: "validUser",
//             firstName: "FirstName",
//             lastName: "LastName",
//             email: "validUser@example.com",
//             isAdmin: false
//           },
//       ],
//     });
//     });
//   });

//   test("unauth for non-admin users", async function () {
//     const resp = await request(app)
//         .get("/users")
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(403);
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .get("/users");
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("fails: test next() handler", async function () {
//     // there's no normal failure event which will cause this route to fail ---
//     // thus making it hard to test that the error-handler works with it. This
//     // should cause an error, all right :)

    
//       // Mock the User.findAll method to throw an error
//    jest.spyOn(User, 'findAll').mockImplementationOnce(async () => {
//      throw new Error("Test Error");
//    }); 
//     const resp = await request(app)
//       .get("/users")
//       .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(500);
//  });
// });

// /************************************** GET /users/:username */

// describe("GET /users/:username", function () {
//   test("works for users", async function () {
//     // Assuming the user 'u1' exists and 'u1Token' is a valid token for 'u1'
//     const resp = await request(app)
//         .get(`/users/u1`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(200);
//     expect(resp.body).toEqual({
//       user: {
//         username: "u1",
//         firstName: expect.any(String),
//         lastName: expect.any(String),
//         email: expect.any(String),
//         isAdmin: expect.any(Boolean),
//       }
//     });
//   });

//   describe("GET /users/:username", function () {
//     test("unauth for non-target user", async function () {
//       // Assuming u1Token is for a non-admin user and u2 is a different user
//       const resp = await request(app)
//         .get(`/users/u2`) // u2 should be different from the user of u1Token
//         .set("authorization", `Bearer ${u1Token}`);
  
//       expect(resp.statusCode).toEqual(403); // Non-admin users can't access other users' data
//     });
//   });

//   test("not found if user not found", async function () {
//     const resp = await request(app)
//         .get(`/users/nope`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });
  

//   test("not found if user missing", async function () {
//     const resp = await request(app)
//         .delete(`/users/nope`)
//         .set("authorization", `Bearer ${adminToken}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("forbidden for non-admin users", async function () {
//     // Assuming 'u1Token' belongs to a non-admin user and 'u2' is a different user
//     const resp = await request(app)
//         .get(`/users/u2`) // Testing access to a different user's data
//         .set("authorization", `Bearer ${u1Token}`);
  
//     expect(resp.statusCode).toEqual(403); // Non-admins should not access other users' data
//   });
  
// });

// /************************************** PATCH /users/:username */

// describe("PATCH /users/:username", () => {
//   const updatedData = { firstName: "NewFirstName" };

//   test("works for users", async function () {
//     const resp = await request(app)
//         .patch(`/users/u1`)
//         .send(updatedData)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(200);
//     expect(resp.body).toEqual({
//       user: {
//         username: "u1",
//         firstName: "NewFirstName",
//         lastName: expect.any(String),
//         email: expect.any(String),
//         isAdmin: expect.any(Boolean),
//       }
//     });
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .patch(`/users/u1`)
//         .send(updatedData);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found if no such user", async function () {
//     const resp = await request(app)
//         .patch(`/users/nope`)
//         .send(updatedData)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });

//   test("bad request if invalid data", async function () {
//     const resp = await request(app)
//         .patch(`/users/u1`)
//         .send({ firstName: 42 })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(400);
//   });

//   test("works: set new password", async function () {
//     const resp = await request(app)
//         .patch(`/users/u1`)
//         .send({
//           password: "new-password",
//         })
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.body).toEqual({
//       user: {
//         username: "u1",
//         firstName: "U1F",
//         lastName: "U1L",
//         email: "user1@user.com",
//         isAdmin: false,
//       },
//     });
//     const isSuccessful = await User.authenticate("u1", "new-password");
//     expect(isSuccessful).toBeTruthy();
//   });
// });

// /************************************** DELETE /users/:username */

// describe("DELETE /users/:username", function () {
//   test("works for users", async function () {
//     const resp = await request(app)
//         .delete(`/users/u1`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(200);
//     expect(resp.body).toEqual({ deleted: "u1" });
//   });

//   test("unauth for anon", async function () {
//     const resp = await request(app)
//         .delete(`/users/u1`);
//     expect(resp.statusCode).toEqual(401);
//   });

//   test("not found if user missing", async function () {
//     const resp = await request(app)
//         .delete(`/users/nope`)
//         .set("authorization", `Bearer ${u1Token}`);
//     expect(resp.statusCode).toEqual(404);
//   });
// });

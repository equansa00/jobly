const request = require("supertest");
const app = require("../app");
const db = require("../db");
let token;

beforeAll(async () => {
    // Ensure the test database is correctly set up and accessible
    // Check if 'testuser' exists in the test database
    // Optionally, log the database URL to confirm the correct database is being used
    console.log("Using Database URL:", process.env.DATABASE_URL);
  
    try {
      // Attempt to log in and retrieve a token
      const res = await request(app)
        .post("/auth/login")
        .send({ username: "testuser", password: "password" });
  
      // Log the entire response for debugging purposes
      console.log("Login Response:", res.body);
  
      // Check if the token is received and log an error if not
      if (!res.body.token) {
        console.error("Token not received:", res.body);
        throw new Error("Token not received");
      }
  
      token = res.body.token;
    } catch (error) {
      console.error("Error during login:", error.message);
      // Consider failing the test explicitly if login is crucial for subsequent tests
    }
  });
  

describe("GET /jobs", () => {
  test("gets a list of jobs", async () => {
    // Use the token in the request.
    // If the token is undefined, this test will likely fail with a 401 error.
    const response = await request(app)
      .get("/jobs")
      .set("Authorization", `Bearer ${token}`);

    // Check if the status code is 200 (OK).
    expect(response.statusCode).toBe(200);

    // You can add more checks here, such as ensuring the response has the expected format.
    // Example: Check if 'jobs' is an array in the response body.
    expect(Array.isArray(response.body.jobs)).toBe(true);
  });
  
//   describe("POST /jobs", () => {
//     test("creates a new job", async () => {
//       const newJob = {
//         title: "New Test Job",
//         salary: 90000,
//         equity: "0.05",
//         company_handle: "c1"
//       };
  
//       const response = await request(app)
//         .post("/jobs")
//         .set("Authorization", `Bearer ${token}`)
//         .send(newJob);
  
//       expect(response.statusCode).toBe(201);
//       expect(response.body).toEqual({
//         job: {
//           id: expect.any(Number),
//           ...newJob
//         }
//       });
//     });
//   });
  
//   describe("PATCH /jobs/:id", () => {
//     test("updates a job", async () => {
//       const response = await request(app)
//         .patch(`/jobs/${testJobId}`)
//         .send({ salary: 95000 });
  
//       expect(response.statusCode).toBe(200);
//       expect(response.body).toEqual({
//         job: {
//           id: testJobId,
//           title: "Test Job",
//           salary: 95000,
//           equity: "0.1",
//           company_handle: "c1"
//         }
//       });
//     });
//   });
  
//   describe("DELETE /jobs/:id", () => {
//     test("deletes a job", async () => {
//       const response = await request(app).delete(`/jobs/${testJobId}`);
//       expect(response.statusCode).toBe(200);
//       expect(response.body).toEqual({ message: "Job deleted" });
  
//       // Optionally, verify that the job no longer exists
//       const resPostDelete = await request(app).get(`/jobs/${testJobId}`);
//       expect(resPostDelete.statusCode).toBe(404);
//     });
//   });
  
// Other tests

afterAll(async () => {
    // Clean up the database
    await db.end();
  });
  
});
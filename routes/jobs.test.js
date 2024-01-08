const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { adminToken } = require("./_testCommon");

let testJobId;

// before all tests, clean out data and set up initial data
beforeAll(async function () {
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");
    
    // Create a company 'c1' for testing
    await db.query(`
      INSERT INTO companies (handle, name, num_employees, description, logo_url)
      VALUES ('c1', 'Company 1', 100, 'Test company', 'http://c1.img')
    `);

    // Create a job and store its ID
    const jobRes = await db.query(`
        INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES ('Test Job', 100000, '0.1', 'c1')
        RETURNING id`);
    testJobId = jobRes.rows[0].id;
});

// before each test, begin a transaction
beforeEach(async function () {
  await db.query("BEGIN");
});

// after each test, rollback transaction
afterEach(async function () {
  await db.query("ROLLBACK");
});

// after all tests, close db connection
afterAll(async function () {
  await db.end();
});

describe("GET /jobs", function () {
  test("gets a list of jobs", async function () {
    const response = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${adminToken}`);
    
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body.jobs)).toBe(true);
  });
});

describe("POST /jobs", () => {
    test("creates a new job", async () => {
        const newJob = {
            title: "New Test Job",
            salary: 90000,
            equity: "0.05",
            company_handle: "c1"
        };
    
        const response = await request(app)
            .post("/jobs")
            .set("Authorization", `Bearer ${adminToken}`)
            .send(newJob);
    
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            job: {
                id: expect.any(Number),
                ...newJob
            }
        });
    });
});

describe("PATCH /jobs/:id", () => {
    test("updates a job", async () => {
        const response = await request(app)
            .patch(`/jobs/${testJobId}`)
            .set("Authorization", `Bearer ${adminToken}`)
            .send({ salary: 95000 });
    
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            job: {
                id: testJobId,
                title: "Test Job",
                salary: 95000,
                equity: "0.1",
                company_handle: "c1"
            }
        });
    });
});


  
describe("DELETE /jobs/:id", () => {
    test("deletes a job", async () => {
      const response = await request(app)
        .delete(`/jobs/${testJobId}`)
        .set("Authorization", `Bearer ${adminToken}`);
  
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ deleted: testJobId.toString() });
  
      const resPostDelete = await request(app).get(`/jobs/${testJobId}`);
      expect(resPostDelete.statusCode).toBe(404);
    });
  });
  

const db = require("../db");
const Job = require("../models/job");
const { NotFoundError } = require("../helpers/expressError");

beforeAll(async () => {
    await db.query("DELETE FROM companies");
    await db.query(`
        INSERT INTO companies (handle, name, num_employees, description, logo_url)
        VALUES 
            ('c1', 'Company 1', 100, 'Description for Company 1', 'http://logo1.url'),
            ('c2', 'Company 2', 200, 'Description for Company 2', 'http://logo2.url'),
            ('c3', 'Company 3', 300, 'Description for Company 3', 'http://logo3.url'),
            ('c4', 'Company 4', 400, 'Description for Company 4', 'http://logo4.url'),
            ('c5', 'Company 5', 500, 'Description for Company 5', 'http://logo5.url');

        INSERT INTO jobs (title, salary, equity, company_handle)
        VALUES 
            ('Software Engineer', 100000, '0.1', 'c1'),
            ('Product Manager', 120000, '0.2', 'c2'),
            ('Data Scientist', 130000, '0', 'c3'),
            ('Marketing Coordinator', 70000, '0', 'c4'),
            ('UX Designer', 90000, '0.05', 'c1'),
            ('Operations Manager', 80000, '0', 'c5'),
            ('HR Specialist', 60000, '0.03', 'c2'),
            ('Financial Analyst', 110000, '0.07', 'c3'),
            ('Quality Assurance Engineer', 95000, '0', 'c4'),
            ('Sales Representative', 50000, '0.02', 'c5');
    `);
});

test("findAll returns all jobs", async () => {
    const jobs = await Job.findAll();
    const expectedNumberOfJobs = 10;
    expect(jobs.length).toEqual(expectedNumberOfJobs);

    jobs.forEach(job => {
        expect(job).toEqual(expect.objectContaining({
            id: expect.any(Number),
            title: expect.any(String),
            salary: expect.any(Number),
            equity: expect.any(String),
            company_handle: expect.any(String)
        }));
    });
});

test("get returns a specific job by id", async () => {
    const allJobs = await Job.findAll();
    const jobToTest = allJobs[0]; 
  
    const job = await Job.get(jobToTest.id); 
    expect(job).toEqual({
      id: jobToTest.id, 
      title: jobToTest.title,
      salary: jobToTest.salary,
      equity: jobToTest.equity,
      company_handle: jobToTest.company_handle 
    });
});

test("create adds a new job", async () => {
    const newJobData = {
      title: "New Job",
      salary: 90000,
      equity: "0.05",
      company_handle: "c3" 
    };
  
    const newJob = await Job.create(newJobData);
    expect(newJob).toEqual(expect.objectContaining({
      id: expect.any(Number),  
      title: newJobData.title,
      salary: newJobData.salary,
      equity: newJobData.equity,
      company_handle: newJobData.company_handle
    }));
  
    const foundJob = await Job.get(newJob.id);
    expect(foundJob).toEqual(newJob);
});

test("update changes job data", async () => {
    const initialJobData = {
      title: "Original Job Title",
      salary: 85000,
      equity: "0.05",
      company_handle: "c3"
    };
    const job = await Job.create(initialJobData);
  
    const updateData = { title: "Updated Job", salary: 95000 };
    const updatedJob = await Job.update(job.id, updateData);
  
    expect(updatedJob).toEqual(expect.objectContaining({
      id: job.id,
      title: updateData.title,
      salary: updateData.salary,
      equity: job.equity,
      company_handle: job.company_handle
    }));
});

test("remove deletes a job", async () => {
    const jobData = {
      title: "Test Job",
      salary: 80000,
      equity: "0.1",
      company_handle: "c1" 
    };
    const job = await Job.create(jobData);
  
    await Job.remove(job.id);
  
    await expect(Job.get(job.id)).rejects.toThrow(NotFoundError);
  });
  
  
  afterAll(async () => {
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");
    await db.end();
});

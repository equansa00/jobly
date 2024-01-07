const db = require('../db');
const { BadRequestError, NotFoundError } = require('../helpers/expressError');
const { sqlForPartialUpdate } = require('../helpers/sql'); // Import sqlForPartialUpdate

class Job {
    // Retrieve all jobs
    static async findAll() {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs
            ORDER BY title`
        );
        return result.rows;
    }

    // Retrieve a specific job by ID
    static async get(id) {
        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle
            FROM jobs
            WHERE id = $1`,
            [id]
        );

        const job = result.rows[0];

        if (!job) {
            throw new NotFoundError(`No job found with ID: ${id}`);
        }

        return job;
    }

    // Create a new job
    static async create({ title, salary, equity, company_handle }) {
        const result = await db.query(
            `INSERT INTO jobs (title, salary, equity, company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle`,
            [title, salary, equity, company_handle]
        );

        return result.rows[0];
    }

    // Update an existing job
    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(data, {});
        const jobIdIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs
                          SET ${setCols} 
                          WHERE id = ${jobIdIdx} 
                          RETURNING id, title, salary, equity, company_handle`;

        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) {
            throw new NotFoundError(`No job found with ID: ${id}`);
        }

        return job;
    }

    // Remove a job
    static async remove(id) {
        const result = await db.query(
            `DELETE FROM jobs
            WHERE id = $1
            RETURNING id`,
            [id]
        );

        if (!result.rows[0]) {
            throw new NotFoundError(`No job found with ID: ${id}`);
        }
    }
}

module.exports = Job;

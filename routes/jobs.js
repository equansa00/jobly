const express = require('express');
const { isAdmin, ensureLoggedIn } = require('../middleware/auth');
const Job = require('../models/job');

const router = new express.Router();

// POST route to create a new job (admin only)
router.post('/', isAdmin, async (req, res, next) => {
    try {
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
});

// GET route to retrieve all jobs
router.get('/', async (req, res, next) => {
    try {
        const jobs = await Job.findAll();
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
});

// GET route to retrieve a specific job by ID
router.get('/:id', async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

// PATCH route to update an existing job (admin only)
router.patch('/:id', isAdmin, async (req, res, next) => {
    try {
        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

// DELETE route to delete a job (admin only)
router.delete('/:id', isAdmin, async (req, res, next) => {
    try {
        await Job.remove(req.params.id);
        return res.json({ deleted: req.params.id });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;

const express = require('express');
const router = express.Router()
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

router.get('/', (req, res, next) => {
    // const employees = req.body.employees;
    db.all(`SELECT * FROM Employee WHERE is_current_employee = 1`, (err, rows) => {
        if (err) {
            console.log('Error retriving employees.');
            console.log('Error: ', err);
            // next(err);
            return;
        }
        res.status(200).send({employees: rows});
    });
});

module.exports = router;
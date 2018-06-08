const express = require('express');
const employeesRouter = express.Router()
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
      (err, employees) => {
        if (err) {
            console.log('Error while retriving employees.');
            console.log('Error: ', err);
            return;
        }
        res.status(200).send({employees: employees});
      });
  });

module.exports = employeesRouter;
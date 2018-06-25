const express = require('express');
const timesheetRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Handle employeeId
timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: timesheetId};
    db.get(sql, values, (err, timesheet) => {
        if (err) {
            next(err);
         } else if (timesheet) {
             req.timesheet = timesheet;
             next();
         } else {
             res.sendStatus(404);
         }
    });
});

// GET timesheets related to employee
timesheetRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
    const values = { $employeeId: req.params.employeeId};
    db.all(sql, values, (err, timesheets) => {
      if (err) {
        next(err);
      } else {
        res.status(200).send({timesheets: timesheets});
      }
    });
  });

  // GET timesheets related to employee
timesheetRouter.post('/', (req, res, next) => {
    db.run(`INSERT INTO Timesheet (hours, rate, date, employee_id) 
            VALUES ($hours, $rate, $date, $employeeId)`, 
        {
            $hours: req.body.timesheet.hours,
            $rate: req.body.timesheet.rate,
            $date: req.body.timesheet.date,
            $employeeId: req.params.employeeId
        },
        function(err) {
            if (err) {
                res.sendStatus(400);
                console.log('Error while creating timesheet.');
                console.log('Error: ', err);
                return;
            }
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, 
            (err, newTimesheet) => {
                if (err) {
                    console.error('Couldnt access added timesheet.');
                    console.log('Error: ', err);
                    return res.sendStatus(500);
                }
                console.log(`A row has been inserted with row ${JSON.stringify(newTimesheet)}`);
                res.status(201).send({timesheet: newTimesheet});
            });
        }
    )
});

timesheetRouter.put('/:timesheetId', (req, res, next) => {
    db.run(`UPDATE Timesheet
            SET hours = $hours,
                rate = $rate,
                date = $date,
                employee_id = $employeeId
            WHERE id = ${req.params.timesheetId}
            `, 
            {
                $hours: req.body.timesheet.hours,
                $rate: req.body.timesheet.rate,
                $date: req.body.timesheet.date,
                $employeeId: req.params.employeeId
            }, function(err) {
                if (err) {
                    console.log('Couldnt update timesheet.');
                    console.log('Error: ', err);
                    res.sendStatus(400);
                    return;
                }
                db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, 
                (err, updatedTimesheet) => {
                    if (err) {
                        console.error('Couldnt access updated timesheet');
                        console.log('Error: ', err);
                        return res.sendStatus(404);
                      }
                      console.log(`A timesheet has been edited:  ${JSON.stringify(updatedTimesheet)}`);
                      res.status(200).send({timesheet: updatedTimesheet});
                });
            });
});

timesheetRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`DELETE FROM Timesheet WHERE Timesheet.id = ${req.params.timesheetId}`, 
    (err, timesheet) => {
        if (err) {
            console.log('Couldnt delete timesheet.');
            console.log('Error: ', err);
            res.sendStatus(400);
            return;
        }
        console.log('Deleted timesheet.');
        return res.sendStatus(204);
    });
});



module.exports = timesheetRouter;
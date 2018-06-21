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
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${req.params.employeeId}`, 
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

// timesheetRouter.post('/', (req, res, next) => {
//     const employeeId = req.body.timesheet.employee_id,
//           hours = req.body.timesheet.hours,
//           rate = req.body.timesheet.rate,
//           date = req.body.timesheet.date
//     const employeeSql = 'SELECT * FROM Employee WHERE Employee.id = $employeeId';
//     const employeeValues = {$employeeId: req.body.timesheet.employee_id};
//     db.get(employeeSql, employeeValues, (error, employee) => {
//       if (error) {
//         next(error);
//       } else {
//         if (!hours || !rate || !date || !employeeId) {
//           return res.sendStatus(400);
//         }
  
//         const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id)' +
//             'VALUES ($hours, $issueNumber, $rate, $employeeId,)';
//         const values = {
//             $employeeId: req.body.timesheet.employee_id,
//             $hours: req.body.timesheet.hours,
//             $rate: req.body.timesheet.rate,
//             $date: req.body.timesheet.date
//         };
  
//         db.run(sql, values, function(error) {
//           if (error) {
//             next(error);
//           } else {
//             db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
//               (error, timesheet) => {
//                 res.status(201).json({timesheet: timesheet});
//               });
//           }
//         });
//       }
//     });
//   });

// timesheetRouter.post('/', (req, res, next) => {
//    db.run(`INSERT INTO Timesheet (employee_id, hours, rate, date) VALUES ($employeeId, $hours, $rate, $date)`, 
//    {
//        // Look at the timesheet table and insert the correct values
//        // Google error: Error:  { Error: SQLITE_CONSTRAINT: NOT NULL constraint failed: Timesheet.employee_id errno: 19, code: 'SQLITE_CONSTRAINT' }
//        $employeeId: req.body.timesheet.employeeId,
//        $hours: req.body.timesheet.hours,
//        $rate: req.body.timesheet.rate,
//        $date: req.body.timesheet.date
//    }, function(err){
//        if (err) {
//             res.sendStatus(400);
//             console.log('Error while creating timesheet.');
//             console.log('Error: ', err);
//             return;
//         }
//         db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`, 
//         (err, newTimesheet) => {
//             if (err) {
//                 console.error('Couldnt access added timesheet.');
//                 console.log('Error: ', err);
//                 return res.sendStatus(500);
//             }
//             console.log(`A row has been inserted with row ${JSON.stringify(newTimesheet)}`);
//             res.status(201).send({timesheet: newTimesheet});
//         });
//    });
// });





module.exports = timesheetRouter;
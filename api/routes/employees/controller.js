const express = require('express');
const employeesRouter = express.Router()
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// GET all employees
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

// POST
employeesRouter.post('/', (req, res, next) => {
    const   name =  req.body.employee.name,
            position = req.body.employee.position,
            wage = req.body.employee.wage,
            isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
    if (!name || !position || !wage || !isCurrentEmployee) {
        return res.sendStatus(400);
    }
        

    const sql = 'INSERT INTO Employee (name, position, wage, isCurrentlyEmployee)'
                + 'VALUES ($name, $position, $wage, $isCurrentlyEmployee)';
    
    const values = {
        $name: name,
        $position: position,
        $wage: wage,
        $isCurrentEmployee: isCurrentEmployee
    };

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Employee WHERE employee.id = ${this.lastID}`, 
            (err, employee) => {
                res.sendStatus(201).json({employee: employee});
            });
        }
    });
});

//   // POST new employee
//   employeesRouter.post('/', (req, res, next) => {
//       db.run(   `INSERT INTO Employee (name, position, wage) VALUES
//                 ($name, $position, $wage)`,
//             {
//                 $name: req.body.employee.name,
//                 $position: req.body.employee.position,
//                 $wage: req.body.employee.wage,
//                 // $is_current_employee: req.body.employee.is_current_emplyee
//             }, function(err){
//                 if (err) {
//                     res.sendStatus(400);
//                     console.log('Error while creating emplyee.');
//                     console.log('Error: ', err);
//                     return;
//                 }
//                 db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, (err, newEmployee) => {
//                     if (err) {
//                       console.error('Couldnt access added row');
//                       console.log('Error: ', err);
//                       return res.sendStatus(500);
//                     }
//                     console.log(`A row has been inserted with row ${JSON.stringify(newEmployee)}`);
//                     res.status(201).json({employee: newEmployee});
//                   });
//             });
//   });

module.exports = employeesRouter;
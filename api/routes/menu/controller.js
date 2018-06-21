const express = require('express');
const menusRouter = express.Router()
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Handle employeeId
menusRouter.param('menuId', (req, res, next, menuId) => {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuid';
    const values = {$menuid: menuId};
    db.get(sql, values, (err, menu) => {
        if (err) {
            next(err);
         } else if (menu) {
             req.menu = menu;
             next();
         } else {
             res.sendStatus(404);
         }
    });
});

menusRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Menu`, 
        (err, menus) => {
            if (err) {
                console.log('Error while retriving menus.');
                console.log('Error: ', err);
                return;
            }
            res.status(200).send({menus: menus});
    });
});
// POST new employee
menusRouter.post('/', (req, res, next) => {
    db.run(   `INSERT INTO Menu (title) VALUES
            ($title)`,
        {
            $title: req.body.menu.title
        }, 
        function(err){
            if (err) {
                res.sendStatus(400);
                console.log('Error while creating menu.');
                console.log('Error: ', err);
                return;
            }
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${this.lastID}`, 
            (err, newMenu) => {
                if (err) {
                    console.error('Couldnt access added menu.');
                    console.log('Error: ', err);
                    return res.sendStatus(500);
                }
                console.log(`A row has been inserted with row ${JSON.stringify(newMenu)}`);
                res.status(201).json({menu: newMenu});
                });
        });
});

// PUT Menu 
menusRouter.put('/:menuId', (req, res, next) => {
    db.run(`UPDATE Menu 
            SET title = $title
            WHERE id = ${req.params.menuId}
            `, 
        {
            $title: req.body.menu.title
        }, function(err){
            if (err) {
                console.log('Couldnt update employee.');
                console.log('Error: ', err);
                res.sendStatus(400);
                return;
            }
            db.run(`SELECT * From Menu WHERE Menu.id = ${req.params.menuId}`, 
            (err, updatedMenu) => {
                if (err) {
                    console.log('Couldnt access employee.');
                    console.log('Error: ', err.message);
                    res.sendStatus(400);
                    return;
                }
                console.log(`A menu has been edited:  ${JSON.stringify(updatedMenu)}`);
                res.status(200).send({menu: updatedMenu});
            });
        });
});

// // GET all employees
// employeesRouter.get('/', (req, res, next) => {
//     db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
//       (err, employees) => {
//         if (err) {
            // console.log('Error while retriving employees.');
            // console.log('Error: ', err);
            // return;
//         }
//         res.status(200).send({employees: employees});
//     });
// });


// // GET single employee
// employeesRouter.get('/:employeeId', (req, res, next) => {
//     res.status(200).send({employee: req.employee});
// });

// // PUT single employee

// // employeesRouter.put('/:employeeId', (req, res, next) => {
// //     res.status(200).send({employee: req.employee});
// // })
// employeesRouter.put('/:employeeId', (req, res, next) => {
//     db.run(`UPDATE Employee 
//             SET name = $name,
//                 position = $position,
//                 wage = $wage,
//                 is_current_employee = $isCurrentEmployee
//             WHERE id = ${req.params.employeeId}
//             `, 
//             {
//                 $name: req.body.employee.name,
//                 $position: req.body.employee.position,
//                 $wage: req.body.employee.wage,
//                 $isCurrentEmployee: req.body.employee.isCurrentEmployee === 0 ? 0 : 1
//             }, 
//             function(err) {
//                 if (err) {
//                     console.log('Couldnt update employee.');
//                     console.log('Error: ', err);
//                     res.sendStatus(400);
//                     return;
//                 }
//                 db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, 
//                 (err, updatedEmployee) => {
//                     if (err) {
//                       console.error('Couldnt access updated employee');
//                       console.log('Error: ', err);
//                       return res.sendStatus(404);
//                     }
//                     console.log(`An employee has been edited:  ${JSON.stringify(updatedEmployee)}`);
//                     res.status(200).send({employee: updatedEmployee});
//                   });
//             })
// });

// // POST new employee
// employeesRouter.post('/', (req, res, next) => {
//     db.run(   `INSERT INTO Employee (name, position, wage, is_current_employee) VALUES
//             ($name, $position, $wage, $isCurrentEmployee)`,
//         {
//             $name: req.body.employee.name,
//             $position: req.body.employee.position,
//             $wage: req.body.employee.wage,
//             $isCurrentEmployee: isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1
//         }, 
//         function(err){
//             if (err) {
//                 res.sendStatus(400);
//                 console.log('Error while creating emplyee.');
//                 console.log('Error: ', err);
//                 return;
//             }
//             db.get(`SELECT * FROM Employee WHERE Employee.id = ${this.lastID}`, 
//             (err, newEmployee) => {
//                 if (err) {
//                     console.error('Couldnt access added employee.');
//                     console.log('Error: ', err);
//                     return res.sendStatus(500);
//                 }
//                 console.log(`A row has been inserted with row ${JSON.stringify(newEmployee)}`);
//                 res.status(201).json({employee: newEmployee});
//                 });
//         });
// });

// // DELETE employee
// employeesRouter.delete('/:employeeId', (req, res, next) => {
//     db.run(  
//         `UPDATE Employee 
//         SET is_current_employee = $isCurrentEmployee
//         WHERE id = ${req.params.employeeId}`, 
//         {
//             $isCurrentEmployee: 0
//         },
//         function(err){
//             if (err) {
//                 console.log('Couldnt delete employee.');
//                 console.log('Error: ', err);
//                 return;
//             }
//             db.get(`SELECT * FROM Employee WHERE Employee.id = ${req.params.employeeId}`, 
//             (err, deletetedEmployee) => {
//                 res.status(200).send({employee: deletetedEmployee});
//             })
//     });
// });

// // GET timesheets related to employee
// employeesRouter.get('/:employeeId/timesheets', (req, res, next) => {
//     db.all('SELECT * FROM Timesheet JOIN Employee ON Timesheet.employee_id = Employee.id',
//       (err, timesheets) => {
//         if (err) {
//             console.log('Error while retriving timesheets.');
//             console.log('Error: ', err);
//             return;
//         }
//         res.status(200).send({timesheets: timesheets});
//     });
// });



module.exports = menusRouter;
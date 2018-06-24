const express = require('express');
const menuItemRouter = express.Router()
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// menuItemRouter.get('/', (req, res, next) => {
//     db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`, 
//     (err, menuItems) => {
//         if (err) {
//             console.error('Couldnt access menu-items.');
//             console.log('Error: ', err);
//             console.log('menu-items: ', menuItems)
//             return res.sendStatus(500);
//         }
//         console.log('menu-items: ', menuItems)
//         res.status(200).send({menuItems: menuItems});
//     })
// });

// GET timesheets related to employee
menuItemRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const values = { $menuId: req.params.menuId};
    db.all(sql, values, (err, menuItems) => {
      if (err) {
        next(err);
      } else {
        res.status(200).send({menuItems: menuItems});
      }
    });
  });

module.exports = menuItemRouter;

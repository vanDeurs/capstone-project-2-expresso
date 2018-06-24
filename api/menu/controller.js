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
                console.log('Couldnt update menu.');
                console.log('Error: ', err);
                res.sendStatus(400);
                return;
            }
            db.run(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, 
            (err, updatedMenu) => {
                if (err) {
                    console.log('Couldnt access menu.');
                    console.log('Error: ', err.message);
                    res.sendStatus(400);
                    return;
                }
                console.log(`A menu has been edited:  ${JSON.stringify(updatedMenu)}`);
                // console.log(`A menu has been edited:  ${updatedMenu}`);
                res.status(200).send({menu: updatedMenu});
            });
        });
});

menusRouter.delete('/:menuId', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE MenuItem.menu_id = ${req.params.menuId}`, 
    (err, menuItem) => {
        const currentMenuItem = menuItem[0]
        if (!menuItem[0]) {
            console.log('Couldnt find related menu item');
            db.all(`DELETE FROM Menu WHERE Menu.id = ${req.params.menuId}`, 
            (err) => {
                if (!err)
                console.log('Succeded in deleting menu');
                return res.sendStatus(204);
            });
        } else {
            console.log('Found items related to menu. Did not delete.');
            return res.sendStatus(400);
        }
    });
});

// // Timesheet things
// const menuItemRouter = require('../menu-items/controller');
// menuItemRouter.use('/:menuId/menu-items', menuItemRouter);

menusRouter.get('/:menuId/menu-items', (req, res, next) => {
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



module.exports = menusRouter;
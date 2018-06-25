const express = require('express');
const menusRouter = express.Router()
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Handle menuId
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

// Handle menu item id
menusRouter.param('menuItemId', (req, res, next, menuItemId) => {
    const sql = 'SELECT * FROM MenuItem WHERE MenuItem.id = $menuItemId';
    const values = {$menuItemId: menuItemId};
    db.get(sql, values, (err, menuItem) => {
        if (err) {
            next(err);
         } else if (menuItem) {
             req.menuItem = menuItem;
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
    db.run(`INSERT INTO Menu (title) 
            VALUES ($title)
            `,
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
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`, 
            (err, updatedMenu) => {
                if (err) {
                    console.log('Couldnt access menu.');
                    console.log('Error: ', err);
                    res.sendStatus(400);
                    return;
                }
                console.log(`A menu has been edited:  ${JSON.stringify(updatedMenu)}`);
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

menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).send({menu: req.menu});
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

menusRouter.post('/:menuId/menu-items', (req, res, next) => {
    db.run(`INSERT INTO MenuItem (menu_id, name, description, inventory, price) 
            VALUES ($menu_id, $name, $description, $inventory, $price)
            `, 
            {
                $menu_id: req.params.menuId,
                $name: req.body.menuItem.name,
                $description: req.body.menuItem.description,
                $inventory: req.body.menuItem.inventory,
                $price: req.body.menuItem.price
            }, function(err) {
                if (err) {
                    console.log('Couldnt create menu item.');
                    console.log('Error: ', err);
                    res.sendStatus(400);
                    return;
                }
                db.all(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`, 
                (err, newMenuItem) => {
                    if (err) {
                        console.error('Couldnt access added menu item.');
                        console.log('Error: ', err);
                        return res.sendStatus(500);
                    }
                    console.log(`A row has been inserted with row ${JSON.stringify(newMenuItem[0])}`);
                    res.status(201).send({menuItem: newMenuItem[0]});
                });
            });
});

menusRouter.put('/:menuId/menu-items/:menuItemId', (req, res, next) => {
    db.run(`UPDATE MenuItem 
            SET menu_id = $menu_id,
                name = $name,
                description = $description,
                inventory = $inventory,
                price = $price
            WHERE id = ${req.params.menuItemId}
            `, 
            {
                $menu_id: req.params.menuId,
                $name: req.body.menuItem.name,
                $description: req.body.menuItem.description,
                $inventory: req.body.menuItem.inventory,
                $price: req.body.menuItem.price
            }, function(err) {
                if (err) {
                    console.log('Couldnt update menu item.');
                    console.log('Error: ', err);
                    res.sendStatus(400);
                    return;
                }
                db.all(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, 
                (err, updatedMenuItem) => {
                    if (err) {
                        console.error('Couldnt access added menu item.');
                        console.log('Error: ', err);
                        return res.sendStatus(404);
                    }
                    if (updatedMenuItem[0]){
                        console.log(`A row has been inserted with row ${JSON.stringify(updatedMenuItem[0])}`);
                        res.status(200).send({menuItem: updatedMenuItem[0]});
                    } else {
                        console.error('Couldnt access added menu item.');
                        return res.sendStatus(404);
                    }
                });
            });
});

menusRouter.delete('/:menuId/menu-items/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`, 
    (err, menuItem) => {
        if (err) {
            console.log('Couldnt delete menu item.');
            console.log('Error: ', err);
            res.sendStatus(404);
            return;
        }
        console.log('Deleted menu item.');
        return res.sendStatus(204);
    });
});





module.exports = menusRouter;
const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const validateMenuItem = (req, res, next) => {
    req.name = req.body.menuItem.name;
    req.description = req.body.menuItem.description;
    req.inventory = req.body.menuItem.inventory;
    req.price = req.body.menuItem.price;
    if (!req.name || !req.description || !req.inventory || !req.price) {
        return res.sendStatus(400);
    } else {
        next();
    }
};

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get(`SELECT * FROM MenuItem WHERE id = ${menuItemId}`,
        (err, data) => {
            if (err) {
                next(err);
            } else if (data) {
                next();
            } else {
                res.sendStatus(404);
            }
        });
});

menuItemsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
        (err, data) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json({menuItems: data});
            }
        });
});

menuItemsRouter.post('/', validateMenuItem, (req, res, next) => {
    db.run(`INSERT INTO MenuItem (name, description, inventory, price, menu_id)
          VALUES ("${req.name}", "${req.description}", "${req.inventory}", "${req.price}", ${req.params.menuId})`,
        function(err, data) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`,
                    (err, data) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(201).json({menuItem: data});
                        }
                    });
            }
        });
});

menuItemsRouter.put('/:menuItemId', validateMenuItem, (req, res, next) => {
    db.run(`UPDATE MenuItem SET name = "${req.name}", description = "${req.description}",
        inventory = "${req.inventory}", price = "${req.price}", menu_id = ${req.params.menuId}
        WHERE id = ${req.params.menuItemId}`,
        function(err, data) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`,
                    (err, data) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(200).json({menuItem: data});
                        }
                    });
            }
        });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    db.run(`DELETE FROM MenuItem WHERE id = ${req.params.menuItemId}`,
        (err) => {
            if (err) {
                next(err);
            } else {
                res.sendStatus(204);
            }
        });
});



module.exports = menuItemsRouter;
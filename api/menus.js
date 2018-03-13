const express = require('express');
const menusRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const menuItemsRouter = require('./menu-items');

const validateMenu = (req, res, next) => {
    req.title = req.body.menu.title;
    if (!req.title) {
        return res.sendStatus(400);
    }
    else {
        next();
    }
};

menusRouter.param('menuId', (req, res, next, menuid) => {
    db.get('SELECT * FROM Menu WHERE id = $id', {$id: menuid},
        (err, data) => {
            if (err) {
                next(err);
            } else if (data) {
                req.menu = data;
                next();
            } else {
                res.sendStatus(404);
            }
        });
});

menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu',
        (err, data) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json({menus: data});
            }
        });
});

menusRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menusRouter.post('/', validateMenu, (req, res, next) => {
    db.run(`INSERT INTO Menu (title) VALUES ("${req.title}")`,
        function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`,
                    (err, data) => {
                        res.status(201).json({menu: data});
                    });
            }
        });
});

menusRouter.put('/:menuId', validateMenu, (req, res, next) => {
    db.run(`UPDATE Menu SET title = "${req.title}" WHERE id = ${req.params.menuId}`,
        function(err) {
            if (err) {
                next(err);
            } else {
                db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`,
                    (err, data) => {
                        res.status(200).json({menu: data});
                    });
            }
        });
});

menusRouter.delete('/:menuId', (req, res, next) => {
    db.get(`SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`,
        function(err, data) {
            if (err) {
                next(err);
            } else {
                if (data) {
                    res.sendStatus(400);
                } else {
                    db.run(`DELETE FROM Menu WHERE id = ${req.params.menuId}`,
                        (err) => {
                            if (err) {
                                next(err);
                            } else {
                                res.sendStatus(204);
                            }
                        });
                }
            }
        });
});

module.exports = menusRouter;
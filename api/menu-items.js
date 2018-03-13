const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

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
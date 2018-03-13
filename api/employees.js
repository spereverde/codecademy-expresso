const express = require('express');
const employeesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

employeesRouter.param('employeeId', (req, res, next, empid) => {
    db.get('SELECT * FROM Employee WHERE id = $id', {$id: empid},
        (err, data) => {
            if (err) {
                next(err);
            } else if (data) {
                req.employee = data;
                next();
            } else {
                res.sendStatus(404);
            }
        });
});

employeesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Employee WHERE is_current_employee = 1',
        (err, data) => {
            if (err) {
                next(err);
            } else {
                res.status(200).json({employees: data});
            }
        });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
});




module.exports = employeesRouter;
const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const fs = require('fs');
const morgan = require('morgan');
const {createEmployeeTable, createTimesheetTable, createMenuTable, createMenuItemTable} = require('./migration');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(morgan('dev'));

// Router
const router = require('./api/routes/index.js');
app.use('/api', router);



app.listen(PORT, err => {
    if (err) {
        console.log('Failed to connect. Error: ', err);
    } else {
        db.serialize(() => {

            // // Drop the tables if they exist.
            db.run('DROP TABLE IF EXISTS Employee');
            db.run('DROP TABLE IF EXISTS Timesheet');
            db.run('DROP TABLE IF EXISTS Menu');
            db.run('DROP TABLE IF EXISTS MenuItem');

            // Set the imported functions to variables
            const createEmployeeQuery   = createEmployeeTable();
            const createTimesheetQuery  = createTimesheetTable();
            const createMenuQuery       = createMenuTable();
            const createMenuItemQuery   = createMenuItemTable();

            // Create the Employee Table
            if (createEmployeeQuery) {
                db.run(createEmployeeQuery, err => {
                    if (err) {
                        console.log('Error while creating the Employee Table.');
                        console.log('Error: ', err);
                        return;
                    }
                    console.log('Successfully created the Employee Table.') 
                });
            }

            // Create the Employee Table
            if (createTimesheetQuery) {
                db.run(createTimesheetQuery, err => {
                    if (err) {
                        console.log('Error while creating the Timesheet Table.');
                        console.log('Error: ', err);
                        return;
                    }
                    console.log('Successfully created the Timesheet Table.');
                });
            }

            // Create the Employee Table
            if (createMenuQuery) {
                db.run(createMenuQuery, err => {
                    if (err) {
                        console.log('Error while creating the Menu Table.');
                        console.log('Error: ', err);
                        return;
                    }
                    console.log('Successfully created the Menu Table.');
                });
            }

            // Create the Employee Table
            if (createMenuItemQuery) {
                db.run(createMenuItemQuery, err => {
                    if (err) {
                        console.log('Error while creating the MenuItem Table.');
                        console.log('Error: ', err);
                        return;
                    }
                    console.log('Successfully created the MenuItem Table.');
                });
            }

        });
    }
});


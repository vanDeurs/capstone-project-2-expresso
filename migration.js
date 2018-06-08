const sqlite3 = require('sqlite3');
var db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

// Create Employee Table
const createEmployeeTable = () => {
    return `CREATE TABLE Employee (
        id INTEGER PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        wage INTEGER NOT NULL,
        is_current_employee INTEGER DEFAULT 1
    );`;
};

// Create Timesheet Table
const createTimesheetTable = () => {
    return `CREATE TABLE Timesheet (
        id INTEGER PRIMARY KEY NOT NULL,
        employee_id INTEGER NOT NULL,
        hours INTEGER NOT NULL,
        rate INTEGER NOT NULL,
        date INTEGER NOT NULL,
        FOREIGN KEY(employee_id) REFERENCES Employee(id)
    );`;
};

// Create Menu Table
const createMenuTable = () => {
    return `CREATE TABLE Menu (
        id INTEGER PRIMARY KEY NOT NULL,
        title TEXT NOT NULL
    );`;
};

// Create MenuItem Table
const createMenuItemTable = () => {
    return `CREATE TABLE MenuItem (
        id INTEGER PRIMARY KEY NOT NULL,
        menu_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        inventory INTEGER NOT NULL,
        price INTEGER NOT NULL,
        FOREIGN KEY(menu_id) REFERENCES Menu(id)
    );`;
};

module.exports = {
    createEmployeeTable,
    createTimesheetTable,
    createMenuTable,
    createMenuItemTable,
};
  



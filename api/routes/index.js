const express = require('express');
const apiRouter = express.Router();

const employeesRouter = require('./employees/controller');
apiRouter.use('/employees', employeesRouter);

const menusRouter = require('./menu/controller');
apiRouter.use('/menus', menusRouter);



module.exports = apiRouter;
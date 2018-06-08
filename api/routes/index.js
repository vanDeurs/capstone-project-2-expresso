const express = require('express');
const router = express.Router();

const employeesRouter = require('./employees/controller');
router.use('/employees', employeesRouter);



module.exports = router;
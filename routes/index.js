var express = require('express');
var router = express.Router();
var userRouter = require('./userRouter/index');
 
router.use('/user',userRouter)

module.exports = router;

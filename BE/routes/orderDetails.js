var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    // localhost:3000/products
  res.send('Đơn hàng chi tiết');
 
});

module.exports = router;
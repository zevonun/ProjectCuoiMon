var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Trang chủ' });
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login');
});

/* GET upload page. */
router.get('/upload', function(req, res, next) {
  res.render('upload');
});


router.get('/products', function(req, res, next) {
  res.render('main', { title: 'produtc' });
});
module.exports = router;

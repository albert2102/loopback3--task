'use strict';

const multer = require('./multer--service');

module.exports = function(app) {
  app.post('/api/users/signUp', multer.multerSaveTo('user').single('avatar'),
    function(req, res, next) {
      next();
    });
  app.put('/api/users/update/:userId',
      multer.multerSaveTo('user').single('avatar'),
      function(req, res, next) {
        next();
      });
};

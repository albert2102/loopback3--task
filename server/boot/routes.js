'use strict';
'use strict';

const multer = require('./multer--service');
//routes to handel multer services and uploading image in post and put methods 
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

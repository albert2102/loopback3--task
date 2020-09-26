'use strict';

const multer = require('multer');
const path = require('path');
const mkdirp = require('mkdirp');
const mime = require('mime');
const uuidv4 = require('uuid/v4');

const fileFilter = (req, file, cb) => {
  if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
    return cb(null, true);
  }

  cb('File upload only supports images types jpg or png');
  return cb(null, true);
};

module.exports.multerSaveTo = function(folderName) {
  let storage = multer.diskStorage({
    destination: function(req, file, cb) {
      let dest = 'storage/' + folderName;
      mkdirp(dest, function(err) {
        if (err)
          return cb('Couldn\'t create dest');
        cb(null, dest);
      });
    },
    filename: function(req, file, cb) {
      if (!file.originalname.includes('.')) {
        var extension = file.mimetype.split('/')[1];
        file.originalname = file.originalname + '.' + extension;
        // console.log("new file name ===> " +file.originalname);
      }
      cb(null, uuidv4() + path.extname(file.originalname));
    },
  });

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 1024 * 300, // limit 300kb
    },
  });
};

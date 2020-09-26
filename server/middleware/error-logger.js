'use strict';
//error handling middleware 
module.exports = function(options) {
    return function logError(err, req, res, next) {
      console.log(err);
      next(err);
    };
  };
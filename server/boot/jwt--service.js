//jwt services
'use strict';

const jwt = require('jsonwebtoken');

const jwtSecret = 'task';
// token genrator
module.exports.generateToken = (id) => {
  return jwt.sign({
    sub: id,
    iss: 'App',
    iat: new Date().getTime(),
  }, jwtSecret, {expiresIn: '1y'});
};
// token verified
module.exports.verifiToken = (token) =>{
  token = token.split(' ');
  return jwt.verify(token[1], jwtSecret, function(err, decoded) {
    if (err) throw new Error('Unauthrization');
    return decoded;
  });
};

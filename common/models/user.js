'use strict';
// import our services
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const jwt = require('../../server/boot/jwt--service');

module.exports = function(User) {
//our validation models
  User.validatesPresenceOf('userName', 'password',
  'fristName', 'lastName', 'email', 'avatar');
  var re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  User.validatesFormatOf('email',
  {with: re, message: 'Must provide a valid email'});
  if (!(User.settings.realmRequired || User.settings.realmDelimiter)) {
    User.validatesUniquenessOf('email', {message: 'Email already exists'});
  }
  User.validatesUniquenessOf('userName', {message: 'User already exists'});
  User.validatesLengthOf('password',
  {min: 6, message: {min: 'Password is too short'}});
  User.validatesLengthOf('fristName',
  {min: 2, message: {min: 'fristName is too short'}});
  User.validatesLengthOf('lastName',
  {min: 2, message: {min: 'lastName is too short'}});
//remote method for creating user
  User.signUp = async function(req, res, next) {
    try {
      let data = req.body;
      if (data.password) {
        const salt = bcrypt.genSaltSync();
        data.password = await bcrypt.hash(data.password, salt);
      }
      if(!data.avatar){
       if (req.file) {
          data.avatar = '/' + req.file.path;
       } else {
          throw new Error('you must provide a picture');
       }
    }
      data = new User(data);
      data.isValid(function(valid) {
        if (!valid) {
          clearImage(data.avatar);
        }
      });
      let user = await User.create(data);
      user.token = jwt.generateToken(user.id);
      return user;
    } catch (err) {
      next(err);
    }
  };
  User.remoteMethod('signUp', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
    ],
    returns: {arg: 'status', type: 'object'},
    http: {path: '/signUp', verb: 'post'},
  });

//remote method for updating user
  User.updateUser = async function(req, res, next) {
    try {
      let data = req.body;
      let token = req.headers['authorization'];
      if (!token) {
        throw new Error('unauthorized');
      }
      let chektoken = jwt.verifiToken(token);
      if (!chektoken) {
        throw new Error('unauthorized');
      }
      let Id = chektoken.sub;
      let {userId} = req.params;
      if (userId != Id) {
        throw new Error('unauthorized');
      }
      const salt = bcrypt.genSaltSync();
      let user = await User.findById(userId);
      if (!user) {
        throw new Error('no such user');
      }
      if (data.oldPassword && data.newPassword) {
        let checkVaild = await bcrypt.compare(data.oldPassword, user.password);
        if (checkVaild) {
          user.password = await bcrypt.hash(data.newPassword, salt);
        } else {
          throw new Error('oldpassword is wrong');
        }
        delete data.newPassword;
        delete data.oldPassword;
      }
      if (req.file) {
        data.avatar = '/' + req.file.path;
        clearImage(user.avatar);
      }
      if (data.avatar) {
        user.avatar = data.avatar;
      }
      if (data.userName) {
        user.userName = data.userName
      }
      if (data.email) {
        user.email = data.email
      }
      if (data.fristName) {
        user.fristName = data.fristName
      }
      if (data.lastName) {
        user.lastName = data.lastName
      }
      user.isValid(function(valid) {
        if (!valid) {
          clearImage(data.avatar);
        }
      });
      let updateduser = await user.updateAttributes(user);
      return updateduser;
    } catch (err) {
      next(err);
    }
  };
  User.remoteMethod('updateUser', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
    ],
    returns: {arg: 'status', type: 'object'},
    http: {path: '/update/:userId', verb: 'put'},
  });

 //remote method for getting user(s)
  User.getallUser = async function(req, res, next) {
    try {
      let token = req.headers['authorization'];
      if (!token) {
        throw new Error('unauthorized');
      }
      let chektoken = jwt.verifiToken(token);
      if (!chektoken) {
        throw new Error('unauthorized');
      }
      var { userName, fristName, lastName, email,id } = req.query;
      let query = {where:{}};
      if (userName) query.where.userName = userName
      if (fristName) query.where.fristName = fristName
      if (lastName) query.where.lastName = lastName
      if (email) query.where.email = email
      if (id) query.where.id = id
      let user = await User.find(query);
      return user;
    } catch (err) {
      next(err);
    }
  };
  User.remoteMethod('getallUser', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
    ],
    returns: {arg: 'status', type: 'object'},
    http: {path: '/getallUser', verb: 'get'},
  });
//hooks for deleting password attrubite from post, ge, put methods' responces
  User.afterRemote('**', function(ctx, user, next) {
    if (ctx.result.status != "User deleted successfully") {
      if (ctx.result.status) {
        if (Array.isArray(ctx.result.status)) {
          ctx.result.status.forEach(function(result) {
            delete result.unsetAttribute('password');
          });
        } else {
          ctx.result.status.unsetAttribute('password');
        }
      }
    }
    next();
  });
//remote method for deleting user
  User.deleteUser = async function(req, res, next) {
    try {
      let token = req.headers['authorization'];
      if (!token) {
        throw new Error('unauthorized');
      }
      let chektoken = jwt.verifiToken(token);
      if (!chektoken) {
        throw new Error('unauthorized');
      }
      let Id = chektoken.sub;
      let {userId} = req.params;
      if (userId != Id) {
        throw new Error('//unauthorized');
      }
      let user = await User.findById(userId)
      if (!user) {
        throw new Error('no such user');
      }
       await User.destroyById(Id);
      return "User deleted successfully";
    } catch (err) {
      next(err);
    }
  };
  User.remoteMethod('deleteUser', {
    accepts: [
      {arg: 'req', type: 'object', 'http': {source: 'req'}},
      {arg: 'res', type: 'object', 'http': {source: 'res'}},
    ],
    returns: {arg: 'status', type: 'object'},
    http: {path: '/deleteUser/:userId', verb: 'delete'},
  });
};

//function for deleting image if validation wrong or throw updating operation 
const clearImage = (filePath) => {
  filePath = path.join(__dirname, '../..', filePath);
  fs.unlink(filePath, err => { return err; });
  return true;
};

'use strict';

var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../server/server');
var should = chai.should();
var token, id;
chai.use(chaiHttp);

describe('user', function () {
  it('should create user on POST /api/user/signUp', function (done) {
    chai.request(server)
      .post('/api/users/signUp')
      .send({
        "userName": "albertEmil1993",
        "fristName": "Albert",
        "lastName": "Emil",
        "email": "albertEmil1993@gmail.com",
        "avatar": "/storage\\user\\fee9ce74-36bb-43ce-90e1-581388988bf6.png",
        "password": "123456"
      })
      .end(function (err, res) {
        token = res.body.status.token
        id = res.body.status.id
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.status.should.be.a('object');
        res.body.status.should.have.property('userName');
        res.body.status.should.have.property('fristName');
        res.body.status.should.have.property('lastName');
        res.body.status.should.have.property('email');
        res.body.status.should.have.property('avatar');
        res.body.status.should.have.property('id');
        res.body.status.should.have.property('token');
        res.body.status.userName.should.equal('albertEmil1993');
        res.body.status.lastName.should.equal('Emil');
        res.body.status.fristName.should.equal('Albert');
        res.body.status.email.should.equal('albertEmil1993@gmail.com');
        res.body.status.avatar.should.equal('/storage\\user\\fee9ce74-36bb-43ce-90e1-581388988bf6.png');
        done();
      })
  });

  it('should update user on PUT /api/users/update/:userId', function (done) {
    chai.request(server)
      .put(`/api/users/update/${id}`)
      .set("authorization", "Bearer " + token)
      .send({
        "userName": "albertEmil1993",
        "fristName": "Albert",
        "lastName": "Emil",
        "email": "albertEmil1993@gmail.com",
        "avatar": "/storage\\user\\fee9ce74-36bb-43ce-90e1-581388988bf6.png",
        "oldPassword": "123456",
        "newPassword": "123456",
      })
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.status.should.be.a('object');
        res.body.status.should.have.property('userName');
        res.body.status.should.have.property('fristName');
        res.body.status.should.have.property('lastName');
        res.body.status.should.have.property('email');
        res.body.status.should.have.property('avatar');
        res.body.status.should.have.property('id');
        res.body.status.userName.should.equal('albertEmil1993');
        res.body.status.lastName.should.equal('Emil');
        res.body.status.fristName.should.equal('Albert');
        res.body.status.email.should.equal('albertEmil1993@gmail.com');
        res.body.status.avatar.should.equal('/storage\\user\\fee9ce74-36bb-43ce-90e1-581388988bf6.png');
        done();
      });
  });

  it('should show all the users or one user  on GET /api/users/getallUser?filter[fields][name]=true', function (done) {
    chai.request(server)
      .get(`/api/users/getallUser?userName=albertEmil&fristName=Albert&lastName=Emil&email=albert.emil19993@gmail.com&id=${id}`)
      .set("authorization", "Bearer " + token)
      .end(function (err, res) {
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.status.should.be.a('array');
        done();
      });
  });

  it('should user delete his account', function (done) {
    chai.request(server)
      .delete(`/api/users/deleteUser/${id}`)
      .set("authorization", "Bearer " + token)
      .end(function (err, res) {
        if (err) return err
        res.should.have.status(200);
        res.body.should.be.a('object');
        res.body.should.have.property('status');
        res.body.status.should.be.a('string');
        done();
      });
  })

});

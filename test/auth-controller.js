import chai from 'chai';
import sinon from 'sinon';
import mongoose from 'mongoose';

import User from '../models/user.js';
import authController from '../controllers/auth.js';

const expect = chai.expect;

describe('Auth controller', () => {
  describe('Login', () => {
    it('should throw an error with code 500 if accessing the database fails', async () => {
      sinon.stub(User, 'findOne');
      User.findOne.throws();
      const req = {
        body: {
          email: 'test@test.com',
          password: 'tester',
        },
      };
      const result = await authController.login(req, {}, () => {});
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      User.findOne.restore();
    });
  });
  describe('User status', () => {
    let user;
    before(async () => {
      await mongoose.connect('mongodb://localhost/testingDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
      });
    });
    it('should send a response with a valid user status for an existing user', async () => {
      user = new User({
        email: 'test@test.com',
        password: 'tester',
        name: 'Test',
        posts: [],
      });
      await user.save();
      const req = { userId: user._id };
      const res = {
        statusCode: 500,
        userStatus: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.userStatus = data.status;
        },
      };
      await authController.getUserStatus(req, res, () => {});
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal('I am new!');
    });
    after(async () => {
      await user.remove();
      await mongoose.disconnect();
    });
  });
});

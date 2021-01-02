import chai from 'chai';
import mongoose from 'mongoose';

import User from '../models/user.js';
import feedController from '../controllers/feed.js';
import socket from '../utils/socket.js';

const expect = chai.expect;

describe('Feed controller', () => {
  let data;
  before(async () => {
    await mongoose.connect('mongodb://localhost/testingDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    socket.init(3000);
  });
  it('should add a created post to the posts of the creator', async () => {
    const user = new User({
      email: 'test@test.com',
      password: 'tester',
      name: 'Test',
      posts: [],
    });
    await user.save();
    const req = {
      body: {
        title: 'Test Post',
        content: 'A Test Post',
      },
      file: {
        path: 'abc',
      },
      userId: user._id,
    };
    const res = {
      status: function () {
        return this;
      },
      json: () => {},
    };
    data = await feedController.createPost(req, res, () => {});
    expect(data.user).to.have.property('posts');
    expect(data.user.posts).to.have.length(1);
  });
  after(async () => {
    await data.user.remove();
    await data.post.remove();
    await mongoose.disconnect();
    socket.getIO().close();
  });
});

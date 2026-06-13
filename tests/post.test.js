import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import sequelize from '../src/config/database.js';
import Post from '../src/models/postModels.js';

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

describe('Post API Endpoint Tests', () => {
  let authToken;
  let testUser;
  let otherAuthToken;
  let otherTestUser;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const registerRes = await request(app)
      .post('/api/v1/user/register')
      .send({
        username: 'posttester',
        email: 'posttester@example.com',
        password: 'password123'
      });

    testUser = registerRes.body.data.user;
    authToken = registerRes.body.data.accessToken;

    const registerRes2 = await request(app)
      .post('/api/v1/user/register')
      .send({
        username: 'otheruser',
        email: 'otheruser@example.com',
        password: 'password123'
      });

    otherTestUser = registerRes2.body.data.user;
    otherAuthToken = registerRes2.body.data.accessToken;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await Post.destroy({ where: {} });
  });

  describe('POST /api/v1/post/create', () => {
    it('should successfully create a post when authorized', async () => {
      const postData = {
        content: 'Hello, this is my first post!'
      };

      const res = await request(app)
        .post('/api/v1/post/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send(postData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('post');
      expect(res.body.post).toHaveProperty('id');
      expect(res.body.post).toHaveProperty('content', postData.content);
      expect(res.body.post).toHaveProperty('userId', testUser.id);
    });

    it('should fail to create a post if authorization header is missing', async () => {
      const postData = {
        content: 'Unauthorized post content'
      };

      const res = await request(app)
        .post('/api/v1/post/create')
        .send(postData);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('Authorization token required');
    });

    it('should fail to create a post if content is missing', async () => {
      const res = await request(app)
        .post('/api/v1/post/create')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('All fields are required');
    });
  });

  describe('GET /api/v1/post', () => {
    it('should successfully retrieve all posts of the logged-in user', async () => {
      await Post.bulkCreate([
        { content: 'Post number one', userId: testUser.id },
        { content: 'Post number two', userId: testUser.id }
      ]);

      const res = await request(app)
        .get('/api/v1/post')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('posts');
      expect(res.body.posts).toHaveLength(2);
      expect(res.body.posts[0]).toHaveProperty('content');
      expect(res.body.posts[0]).toHaveProperty('userId', testUser.id);
    });
  });

  describe('PATCH /api/v1/post/:id', () => {
    it('should successfully update post content', async () => {
      const post = await Post.create({
        content: 'Original post content',
        userId: testUser.id
      });

      const updatedContent = 'Updated post content';

      const res = await request(app)
        .patch(`/api/v1/post/${post.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: updatedContent });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', post.id);
      expect(res.body).toHaveProperty('content', updatedContent);

      const updatedPost = await Post.findByPk(post.id);
      expect(updatedPost.content).toBe(updatedContent);
    });

    it('should fail to update another user\'s post', async () => {
      const post = await Post.create({
        content: 'Original post content',
        userId: testUser.id
      });

      const updatedContent = 'Updated post content';

      const res = await request(app)
        .patch(`/api/v1/post/${post.id}`)
        .set('Authorization', `Bearer ${otherAuthToken}`)
        .send({ content: updatedContent });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('You are not authorized to update this post');
    });
  });

  describe('DELETE /api/v1/post/:id', () => {
    it('should successfully delete a post', async () => {
      const post = await Post.create({
        content: 'Post to be deleted',
        userId: testUser.id
      });

      const res = await request(app)
        .delete(`/api/v1/post/${post.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Post deleted successfully');
      expect(res.body).toHaveProperty('id', post.id);

      const deletedPost = await Post.findByPk(post.id);
      expect(deletedPost).toBeNull();
    });

    it('should fail to delete another user\'s post', async () => {
      const post = await Post.create({
        content: 'Post to be deleted',
        userId: testUser.id
      });

      const res = await request(app)
        .delete(`/api/v1/post/${post.id}`)
        .set('Authorization', `Bearer ${otherAuthToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('You are not authorized to delete this post');

      const notDeletedPost = await Post.findByPk(post.id);
      expect(notDeletedPost).not.toBeNull();
    });
  });
});

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import sequelize from '../src/config/database.js';
import User from '../src/models/userModels.js';

process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  await User.destroy({ where: {}, truncate: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('User Authentication API Endpoint Tests', () => {
  describe('POST /api/v1/user/register', () => {
    it('should successfully register a new user and return tokens', async () => {
      const userData = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/user/register')
        .send(userData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('username', userData.username);
      expect(res.body.data.user).toHaveProperty('email', userData.email);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should fail registration when required fields are missing', async () => {
      const incompleteData = {
        username: 'testuser'
      };

      const res = await request(app)
        .post('/api/v1/user/register')
        .send(incompleteData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('All fields are required');
    });

    it('should fail registration when email is already registered', async () => {
      const userData = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      };

      await request(app).post('/api/v1/user/register').send(userData);

      const res = await request(app)
        .post('/api/v1/user/register')
        .send({
          username: 'anotherusername',
          email: 'testuser@example.com',
          password: 'anotherpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('User already exists');
    });
  });

  describe('POST /api/v1/user/login', () => {
    beforeEach(async () => {
      const userData = {
        username: 'loginuser',
        email: 'loginuser@example.com',
        password: 'password123'
      };
      await request(app).post('/api/v1/user/register').send(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const credentials = {
        email: 'loginuser@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/user/login')
        .send(credentials);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'User logged in successfully');
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email', credentials.email);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should fail login with incorrect password', async () => {
      const credentials = {
        email: 'loginuser@example.com',
        password: 'wrongpassword'
      };

      const res = await request(app)
        .post('/api/v1/user/login')
        .send(credentials);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('Invalid password');
    });

    it('should fail login if email is not found', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const res = await request(app)
        .post('/api/v1/user/login')
        .send(credentials);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('User not found');
    });
  });
});

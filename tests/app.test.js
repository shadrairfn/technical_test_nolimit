import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import sequelize from '../src/config/database.js';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Express Application Tests', () => {
  describe('GET /health', () => {
    it('should return 200 OK and uptime info', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('uptime');
    });
  });

  describe('GET /', () => {
    it('should return 200 welcome message', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Welcome to Nolimit Intern API');
      expect(res.body).toHaveProperty('status', 'success');
    });
  });

  describe('404 Not Found handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const res = await request(app).get('/api/v1/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('status', 'error');
      expect(res.body.message).toContain('Not Found');
    });
  });
});

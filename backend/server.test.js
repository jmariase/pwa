import request from 'supertest';
import app from './server.js';

describe('Express Backend API Test Suite', () => {
  describe('GET /health', () => {
    test('should return 200 OK with correct payload structure', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database', 'connected');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/info', () => {
    test('should return 200 OK with API specifications', async () => {
      const response = await request(app).get('/api/info');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service', 'Port PWA Backend API');
      expect(response.body).toHaveProperty('version', '1.0.0');
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('environment', 'test');
    });
  });
});

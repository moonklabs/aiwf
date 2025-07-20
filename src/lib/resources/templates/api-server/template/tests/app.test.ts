import request from 'supertest';
import app from '../src/app';

describe('App', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api/v1/status', () => {
    it('should return API status', async () => {
      const response = await request(app)
        .get('/api/v1/status')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('service');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('aiwf');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.statusCode).toBe(404);
    });
  });
});
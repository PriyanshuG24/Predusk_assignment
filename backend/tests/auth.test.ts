import {env} from "../src/config/env.js";
import request from 'supertest';
import app from '../src/app.js';
const basicAuthHeader = () => {
  const token = Buffer.from(
    `${env.BASIC_AUTH_EMAIL}:${env.BASIC_AUTH_PASS}`,
  ).toString('base64');

  return `Basic ${token}`;
};


describe('Basic Auth protection', () => {
  it('returns 401 when no auth is provided', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .send({ education: 'get profile' });

    expect(res.status).toBe(401);
  });
});

it('returns 200 when valid basic auth is provided', async () => {
  const res = await request(app)
    .get('/api/user/profile')
    .set('Authorization', basicAuthHeader())
    .send({ education: 'get profile' });

  expect(res.status).toBe(200);
});

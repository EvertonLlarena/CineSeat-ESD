import { expect, it } from 'vitest';
import { buildApp } from '../src/app.js';

it('payment reports healthy', async () => {
  const app = buildApp({ logger: false });

  const response = await app.inject({ method: 'GET', url: '/health' });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ status: 'ok', service: 'payment' });
  await app.close();
});

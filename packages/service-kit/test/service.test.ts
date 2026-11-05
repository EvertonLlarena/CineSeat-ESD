import { afterEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createService } from '../src/index.js';

describe('createService', () => {
  let app: FastifyInstance;

  afterEach(() => app.close());

  it('reports health with the service name', async () => {
    app = createService({ name: 'demo', logger: false });

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', service: 'demo' });
  });

  it('exposes request duration metrics labelled with the service', async () => {
    app = createService({ name: 'demo', logger: false });
    await app.inject({ method: 'GET', url: '/health' });

    const response = await app.inject({ method: 'GET', url: '/metrics' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toMatch(
      /http_request_duration_seconds_count\{[^}]*service="demo"[^}]*route="\/health"[^}]*\} 1/,
    );
  });
});

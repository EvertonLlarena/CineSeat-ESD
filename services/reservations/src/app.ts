import { createService } from '@cineseat/service-kit';
import type { FastifyInstance } from 'fastify';

export function buildApp(options: { logger?: boolean } = {}): FastifyInstance {
  return createService({ name: 'reservations', ...options });
}

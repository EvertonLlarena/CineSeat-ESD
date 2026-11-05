import Fastify, { type FastifyBaseLogger, type FastifyInstance } from 'fastify';
import { Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export interface ServiceOptions {
  name: string;
  logger?: boolean;
}

/** Builds a Fastify app with the endpoints and metrics every CineSeat service must expose. */
export function createService({ name, logger = true }: ServiceOptions): FastifyInstance {
  const app = Fastify({ logger });

  const registry = new Registry();
  registry.setDefaultLabels({ service: name });
  collectDefaultMetrics({ register: registry });

  const requestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.3, 0.5, 1, 2.5, 5],
    registers: [registry],
  });

  app.addHook('onResponse', async (request, reply) => {
    requestDuration.observe(
      {
        method: request.method,
        route: request.routeOptions.url ?? 'unmatched',
        status_code: reply.statusCode,
      },
      reply.elapsedTime / 1000,
    );
  });

  app.get('/health', async () => ({ status: 'ok', service: name }));

  app.get('/metrics', async (_request, reply) => {
    reply.header('content-type', registry.contentType);
    return registry.metrics();
  });

  return app;
}

/** Starts listening on PORT and closes the app cleanly on SIGINT and SIGTERM. */
export async function startService(app: FastifyInstance, defaultPort: number): Promise<void> {
  const port = Number(process.env.PORT ?? defaultPort);
  const log: FastifyBaseLogger = app.log;

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      log.info({ signal }, 'shutting down');
      app.close().then(
        () => process.exit(0),
        (error: unknown) => {
          log.error(error);
          process.exit(1);
        },
      );
    });
  }

  await app.listen({ host: '0.0.0.0', port });
}

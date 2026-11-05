import { startService } from '@cineseat/service-kit';
import { buildApp } from './app.js';

await startService(buildApp(), 3001);

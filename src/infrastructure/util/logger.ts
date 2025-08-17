import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pino = require('pino') as any;
export const logger = pino({ name: 'jq-archi-scan' });
